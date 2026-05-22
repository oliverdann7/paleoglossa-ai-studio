interface Props {
  languageId?: string;
  children: React.ReactNode;
}

// All languages are accessible on every plan — no redirect needed.
// The only difference between plans is how many words can be saved per language.
export function LanguageGuard({ children }: Props) {
  return <>{children}</>;
}
