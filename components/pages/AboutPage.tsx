import React from 'react';
// Fix: Import the missing LegalScaleIcon component.
import { BriefcaseIcon, CodeBracketIcon, SparklesIcon, AiBrainIcon, MagnifyingGlassPlusIcon, LinkIcon, LegalScaleIcon } from '../icons/Icons';

const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-light-neutral dark:bg-gray-800/50 p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center">
        <div className="text-gold mb-4">
            {icon}
        </div>
        <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-2">{title}</h3>
        <p className="text-dark-gray dark:text-gray-300 text-sm">{children}</p>
    </div>
);


const AboutPage: React.FC = () => {
    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
            
                {/* Header Section */}
                <header className="text-center">
                    <LegalScaleIcon className="w-12 h-12 mx-auto text-gold mb-4" />
                    <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">About Indian Legal Acts</h1>
                    <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">Empowering Legal Research Through AI and Innovation</p>
                </header>

                {/* Purpose Section */}
                <section>
                    <h2 className="font-heading text-2xl font-bold text-gold mb-3 text-center">Our Purpose</h2>
                    <p className="text-center text-dark-gray dark:text-gray-200">
                        Indian Legal Acts is an AI-powered legal research assistant designed to speed up research, reduce errors, and explain India’s new model Acts — the Bhartiya Nyaya Sanhita (BNS), Bhartiya Nagrik Suraksha Sanhita (BNSS), and Bhartiya Saksya Adhiniyam (BSA) — in plain, practical language.
                    </p>
                </section>
                
                {/* Quote Block */}
                <div className="text-center py-4">
                    <p className="text-2xl font-light italic text-gold">“Research faster. Interpret smarter. Present confidently.”</p>
                </div>


                {/* Benefits Section */}
                <section>
                     <h2 className="font-heading text-2xl font-bold text-gold mb-6 text-center">Benefits for Legal Professionals</h2>
                     <div className="grid md:grid-cols-3 gap-8">
                        <BenefitCard icon={<MagnifyingGlassPlusIcon className="w-10 h-10" />} title="Faster Discovery">
                            Search across thousands of sections and case laws in seconds — no need to dig through outdated PDFs.
                        </BenefitCard>
                        <BenefitCard icon={<LinkIcon className="w-10 h-10" />} title="Reliable Cross-References">
                            Our system automatically connects related sections, helping you explore all angles of a case efficiently.
                        </BenefitCard>
                        <BenefitCard icon={<SparklesIcon className="w-10 h-10" />} title="AI-Assisted Drafting">
                            Generate structured pleadings, charge sheets, or complete case reports with just a few inputs.
                        </BenefitCard>
                     </div>
                </section>

                {/* Team Section */}
                <section>
                    <h2 className="font-heading text-2xl font-bold text-gold mb-4 text-center">Our Team & Affiliation</h2>
                    <p className="text-center text-dark-gray dark:text-gray-200 mb-6">
                        We are a passionate team of law professionals, software engineers, and AI specialists based in Navi Mumbai, Maharashtra, India. Together, we combine deep legal knowledge with cutting-edge machine learning to bring you India’s smartest legal research tool. Indian Legal Acts is proud to be part of the <span className="font-semibold">Aviyana RPG Group</span>, a company committed to building technology-driven solutions for a modern India.
                    </p>
                    <div className="flex justify-center items-center gap-6 flex-wrap bg-light-neutral dark:bg-gray-800/50 py-4 px-6 rounded-lg">
                        <div className="flex items-center gap-2 text-dark-gray dark:text-light-neutral font-semibold"><BriefcaseIcon className="w-5 h-5 text-gold" /> Legal Experts</div>
                        <div className="flex items-center gap-2 text-dark-gray dark:text-light-neutral font-semibold"><CodeBracketIcon className="w-5 h-5 text-gold" /> Software Engineers</div>
                        <div className="flex items-center gap-2 text-dark-gray dark:text-light-neutral font-semibold"><AiBrainIcon className="w-5 h-5 text-gold" /> AI Researchers</div>
                    </div>
                </section>

                {/* Driving Quote */}
                <div className="text-center border-t border-b border-gray-200 dark:border-gray-700 py-6">
                    <p className="text-xl italic text-gold">“At Indian Legal Acts, we believe the law should be clear, fast, and human — powered by intelligence, guided by integrity.”</p>
                </div>

                {/* Vision Section */}
                <section>
                    <h2 className="font-heading text-2xl font-bold text-gold mb-3 text-center">Our Vision 2026</h2>
                    <p className="text-center text-dark-gray dark:text-gray-200">
                        By 2026, we aim to make Indian Legal Acts the most trusted AI-powered legal platform — serving lawyers, students, corporates, and law enforcement agencies across India with data-driven accuracy and speed.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;