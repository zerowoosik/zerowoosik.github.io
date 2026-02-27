export function Footer() {
    return (
        <footer className="w-full py-12 mt-16 border-t border-border-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-text-muted text-sm">
                    © {new Date().getFullYear()} zerowoosik&apos;s Blog. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
