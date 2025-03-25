export function Footer() {
  return (
    <footer className="w-full border-t border-border/50">
      <div className="container flex items-center justify-between h-16">
        <p className="text-sm text-muted-foreground">
          Built with ♥️ by{" "}
          <a
            href="https://twitter.com/papingothegamer"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Tolu
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/papingothegamer/vibe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/papingothegamer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  )
}