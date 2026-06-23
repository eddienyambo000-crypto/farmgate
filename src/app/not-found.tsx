import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-grain px-4">
      <div className="text-center">
        <p className="font-display text-6xl font-extrabold text-leaf">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          The animal or page you&apos;re looking for may have been sold or moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/animals">Browse animals</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
