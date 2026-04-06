import classNames from "classnames";

export const Button = ({
  variant,
  label,
  onClick,
}: {
  variant: "primary" | "secondary";
  label: string;
  onClick: () => void;
}) => (
  <button
    className={classNames(
      "inline-flex w-full items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
      {
        "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800": variant === "primary",
        "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400": variant === "secondary",
      },
    )}
    onClick={onClick}
  >
    {label}
  </button>
);
