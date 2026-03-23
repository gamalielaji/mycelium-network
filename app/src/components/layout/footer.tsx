import { CLUSTER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>🍄 Mycelium Protocol</span>
          <span>·</span>
          <span>Decentralized IP Infrastructure on Solana</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700">
            {CLUSTER}
          </span>
          <a
            href="https://github.com/gamalielaji/mycelium-network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
