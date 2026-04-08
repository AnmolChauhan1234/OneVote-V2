export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm leading-loose md:text-left">
          Built by OneVote Team. Hosted on{' '}
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=readme&utm_campaign=nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Vercel
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
