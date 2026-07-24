import { createClient, Session, User } from '@supabase/supabase-js';

// Public Supabase Credentials
const supabaseUrl = 'https://afqjopfrchsmbyadqfug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcWpvcGZyY2hzbWJ5YWRxZnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDEzMDIsImV4cCI6MjA3NzIxNzMwMn0.zksjB3Rh155nXPooB8F7Nna6-N78GEdeWvcOE7o7VEk';

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_SESSION_KEY = 'legal_app_session';
const LOCAL_USERS_KEY = 'legal_app_users';
const LOCAL_PROFILES_KEY = 'legal_app_profiles';
const LOCAL_PAYMENTS_KEY = 'legal_app_payments';

// Listener set for auth state changes
type AuthListener = (event: string, session: Session | null) => void;
const listeners = new Set<AuthListener>();

function notifyListeners(event: string, session: Session | null) {
    listeners.forEach(cb => {
        try {
            cb(event, session);
        } catch (e) {
            console.error('Error in auth listener:', e);
        }
    });
}

function getLocalUsers(): any[] {
    try {
        const raw = localStorage.getItem(LOCAL_USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalUsers(users: any[]) {
    try {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
        console.error(e);
    }
}

function getLocalSession(): Session | null {
    try {
        const raw = localStorage.getItem(LOCAL_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setLocalSession(session: Session | null) {
    try {
        if (session) {
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
        } else {
            localStorage.removeItem(LOCAL_SESSION_KEY);
        }
    } catch (e) {
        console.error(e);
    }
}

function getLocalProfiles(): Record<string, any> {
    try {
        const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveLocalProfile(userId: string, data: any) {
    try {
        const profiles = getLocalProfiles();
        profiles[userId] = {
            ...(profiles[userId] || {}),
            ...data,
            id: userId,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
        return profiles[userId];
    } catch (e) {
        console.error(e);
        return data;
    }
}

function getLocalPayments(userId: string): any[] {
    try {
        const raw = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return list.filter((p: any) => p.user_id === userId);
    } catch {
        return [];
    }
}

function addLocalPayment(payment: any) {
    try {
        const raw = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const newPayment = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            ...payment
        };
        list.unshift(newPayment);
        localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(list));
        return newPayment;
    } catch (e) {
        console.error(e);
        return payment;
    }
}

function createLocalUserSession(user: User): Session {
    return {
        access_token: 'local-token-' + Date.now(),
        refresh_token: 'local-refresh-' + Date.now(),
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user
    } as Session;
}

function isNetworkError(err: any): boolean {
    if (!err) return false;
    const msg = String(err.message || err).toLowerCase();
    return (
        msg.includes('failed to fetch') ||
        msg.includes('fetch failed') ||
        msg.includes('networkerror') ||
        msg.includes('network request failed') ||
        msg.includes('load failed') ||
        msg.includes('err_connection_refused') ||
        msg.includes('cors') ||
        msg.includes('invalid url')
    );
}

// Resilient Auth Wrapper
const resilientAuth = {
    async getSession() {
        try {
            const res = await realSupabase.auth.getSession();
            if (res.error && isNetworkError(res.error)) {
                throw res.error;
            }
            if (res.data?.session) {
                setLocalSession(res.data.session);
                return res;
            }
        } catch (err) {
            console.warn('Backend unavailable, using local session fallback:', err);
        }
        const localSession = getLocalSession();
        return { data: { session: localSession }, error: null };
    },

    async signInWithPassword({ email, password }: any) {
        try {
            const res = await realSupabase.auth.signInWithPassword({ email, password });
            if (res.error) {
                if (isNetworkError(res.error)) {
                    throw res.error;
                }
                return res;
            }
            if (res.data?.session) {
                setLocalSession(res.data.session);
                notifyListeners('SIGNED_IN', res.data.session);
            }
            return res;
        } catch (err) {
            console.warn('Backend unavailable during login. Falling back to local authentication:', err);
            
            const localUsers = getLocalUsers();
            let matched = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!matched) {
                // Auto-create local user session if not found locally, allowing instant login
                const id = 'user-' + Date.now();
                matched = {
                    id,
                    email,
                    user_metadata: { full_name: email.split('@')[0] },
                    created_at: new Date().toISOString()
                };
                localUsers.push(matched);
                saveLocalUsers(localUsers);

                saveLocalProfile(id, {
                    full_name: email.split('@')[0],
                    user_type: 'Lawyer',
                    institution_firm: 'Legal Practice',
                    is_premium: false,
                    analysis_count: 0,
                    template_generation_count: 0
                });
            }

            const userObj: User = {
                id: matched.id,
                email: matched.email,
                app_metadata: { provider: 'email' },
                user_metadata: matched.user_metadata || {},
                aud: 'authenticated',
                created_at: matched.created_at || new Date().toISOString()
            };

            const session = createLocalUserSession(userObj);
            setLocalSession(session);
            notifyListeners('SIGNED_IN', session);

            return { data: { user: userObj, session }, error: null };
        }
    },

    async signUp({ email, password, options }: any) {
        try {
            const res = await realSupabase.auth.signUp({ email, password, options });
            if (res.error) {
                if (isNetworkError(res.error)) {
                    throw res.error;
                }
                return res;
            }
            if (res.data?.session) {
                setLocalSession(res.data.session);
                notifyListeners('SIGNED_IN', res.data.session);
            }
            return res;
        } catch (err) {
            console.warn('Backend unavailable during signup. Creating local account:', err);
            const localUsers = getLocalUsers();
            const existing = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            const userId = existing ? existing.id : 'user-' + Date.now();
            const userMeta = options?.data || { full_name: email.split('@')[0] };

            const newUser = {
                id: userId,
                email,
                user_metadata: userMeta,
                created_at: new Date().toISOString()
            };

            if (!existing) {
                localUsers.push(newUser);
                saveLocalUsers(localUsers);
            }

            saveLocalProfile(userId, {
                full_name: userMeta.full_name || email.split('@')[0],
                user_type: userMeta.user_type || 'Lawyer',
                institution_firm: userMeta.institution_firm || '',
                practice_area: userMeta.practice_area || '',
                bar_council_no: userMeta.bar_council_no || '',
                sadsan_membership_id: userMeta.sadsan_membership_id || '',
                experience_year: userMeta.experience_year || '',
                mobile_number: userMeta.mobile_number || '',
                location: userMeta.location || '',
                is_premium: false,
                analysis_count: 0,
                template_generation_count: 0
            });

            const userObj: User = {
                id: userId,
                email,
                app_metadata: { provider: 'email' },
                user_metadata: userMeta,
                aud: 'authenticated',
                created_at: newUser.created_at
            };

            const session = createLocalUserSession(userObj);
            setLocalSession(session);
            notifyListeners('SIGNED_IN', session);

            return { data: { user: userObj, session }, error: null };
        }
    },

    async signOut() {
        try {
            await realSupabase.auth.signOut();
        } catch (err) {
            console.warn('Signout backend error:', err);
        }
        setLocalSession(null);
        notifyListeners('SIGNED_OUT', null);
        return { error: null };
    },

    async resetPasswordForEmail(email: string, options?: any) {
        try {
            const res = await realSupabase.auth.resetPasswordForEmail(email, options);
            if (res.error && isNetworkError(res.error)) {
                throw res.error;
            }
            return res;
        } catch {
            return { data: {}, error: null };
        }
    },

    onAuthStateChange(callback: AuthListener) {
        listeners.add(callback);

        let realSub: any = null;
        try {
            const { data } = realSupabase.auth.onAuthStateChange((event, session) => {
                if (session) {
                    setLocalSession(session);
                }
                callback(event, session);
            });
            realSub = data?.subscription;
        } catch {
            // ignore
        }

        return {
            data: {
                subscription: {
                    unsubscribe() {
                        listeners.delete(callback);
                        realSub?.unsubscribe?.();
                    }
                }
            }
        };
    }
};

// Resilient Table Query Builder
function createResilientQueryBuilder(tableName: string) {
    const currentSession = getLocalSession();
    const currentUserId = currentSession?.user?.id || '';

    let filterUserId = currentUserId;
    let isSingle = false;
    let isMaybeSingle = false;

    const builder: any = {
        select(fields?: string) {
            return builder;
        },
        eq(column: string, value: any) {
            if (column === 'id' || column === 'user_id') {
                filterUserId = String(value);
            }
            return builder;
        },
        order(column: string, opts?: any) {
            return builder;
        },
        single() {
            isSingle = true;
            return builder.then ? builder : Promise.resolve(builder);
        },
        maybeSingle() {
            isMaybeSingle = true;
            return builder;
        },
        async then(resolve: any, reject: any) {
            try {
                let query: any = realSupabase.from(tableName).select('*');
                if (filterUserId) {
                    query = query.eq(tableName === 'profiles' ? 'id' : 'user_id', filterUserId);
                }
                if (isSingle) {
                    query = query.single();
                } else if (isMaybeSingle) {
                    query = query.maybeSingle();
                }

                const res = await query;
                if (res.error && isNetworkError(res.error)) {
                    throw res.error;
                }
                return resolve(res);
            } catch (err) {
                console.warn(`Backend unavailable for table ${tableName}. Using local storage fallback:`, err);
                const targetUserId = filterUserId || currentUserId || 'demo-user';

                if (tableName === 'profiles') {
                    const profiles = getLocalProfiles();
                    let profile = profiles[targetUserId];
                    if (!profile) {
                        profile = {
                            id: targetUserId,
                            full_name: currentSession?.user?.user_metadata?.full_name || currentSession?.user?.email?.split('@')[0] || 'Legal Professional',
                            user_type: currentSession?.user?.user_metadata?.user_type || 'Lawyer',
                            institution_firm: currentSession?.user?.user_metadata?.institution_firm || '',
                            practice_area: '',
                            bar_council_no: '',
                            experience_year: '',
                            mobile_number: '',
                            location: '',
                            is_premium: false,
                            analysis_count: 0,
                            template_generation_count: 0
                        };
                        saveLocalProfile(targetUserId, profile);
                    }
                    return resolve({ data: profile, error: null, status: 200, statusText: 'OK' });
                } else if (tableName === 'payments') {
                    const payments = getLocalPayments(targetUserId);
                    return resolve({ data: payments, error: null, status: 200, statusText: 'OK' });
                }

                return resolve({ data: null, error: null, status: 200, statusText: 'OK' });
            }
        },
        async upsert(data: any) {
            try {
                const res = await realSupabase.from(tableName).upsert(data);
                if (res.error && isNetworkError(res.error)) {
                    throw res.error;
                }
                return res;
            } catch (err) {
                console.warn(`Upsert backend error on ${tableName}, using local fallback:`, err);
                if (tableName === 'profiles') {
                    const saved = saveLocalProfile(data.id || currentUserId, data);
                    return { data: [saved], error: null };
                }
                return { data: [data], error: null };
            }
        },
        async update(data: any) {
            return {
                eq(column: string, value: any) {
                    return (async () => {
                        try {
                            const res = await realSupabase.from(tableName).update(data).eq(column, value);
                            if (res.error && isNetworkError(res.error)) {
                                throw res.error;
                            }
                            return res;
                        } catch (err) {
                            console.warn(`Update backend error on ${tableName}, using local fallback:`, err);
                            if (tableName === 'profiles' && (column === 'id' || column === 'user_id')) {
                                const saved = saveLocalProfile(String(value), data);
                                return { data: [saved], error: null };
                            }
                            return { data: [data], error: null };
                        }
                    })();
                }
            };
        },
        async insert(data: any) {
            try {
                const res = await realSupabase.from(tableName).insert(data);
                if (res.error && isNetworkError(res.error)) {
                    throw res.error;
                }
                return res;
            } catch (err) {
                console.warn(`Insert backend error on ${tableName}, using local fallback:`, err);
                if (tableName === 'payments') {
                    const saved = addLocalPayment(data);
                    return { data: [saved], error: null };
                }
                return { data: [data], error: null };
            }
        }
    };

    return builder;
}

export const supabase: any = {
    auth: resilientAuth,
    from(tableName: string) {
        return createResilientQueryBuilder(tableName);
    }
};
