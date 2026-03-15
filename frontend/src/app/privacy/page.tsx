export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white py-24 px-6 md:px-12 animate-in fade-in duration-500">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-neutral max-w-none space-y-6 text-[#4B5563]">
                    <p>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#111827] mb-4">1. Information We Collect</h2>
                        <p>
                            When you use AI Developer Roast Lab, we collect the public information associated with the GitHub usernames or LinkedIn URLs you provide. For resume roasting, we temporarily process the text or file you upload.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#111827] mb-4">2. How We Use Your Information</h2>
                        <p>
                            The information we collect is strictly used to generate humorous, AI-driven roasts and constructive feedback entirely for entertainment and personal improvement purposes.
                            We do not permanently store your resumes, GitHub data, or LinkedIn profile data on our servers after the request is completed. Data is passed to our third-party AI providers (e.g. OpenAI, Groq, NVIDIA) solely for the purpose of generating the roast.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#111827] mb-4">3. Data Sharing and Third Parties</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personal information to outside parties except to our trusted AI API providers needed to operate the service. These APIs have their own privacy policies regarding temporary data retention.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#111827] mb-4">4. Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of the information transmitted to the application. However, no internet transmission is completely secure, and you use the service at your own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#111827] mb-4">5. Changes to This Policy</h2>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
