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
            "text-button group flex h-auto items-center justify-center overflow-hidden px-6 py-3 outline-none transition duration-300",
            {
                "rounded-full border border-light bg-white hover:bg-light hover:text-dark":
                    variant === "primary",
                "rounded-full border border-light bg-light shadow-none hover:bg-light/5":
                    variant === "secondary",
            },
        )}
        onClick={onClick}
    >
        <span
            className={classNames("text-base transition duration-200", {
                "text-light group-hover:text-dark group-hover:[&>svg>line]:stroke-black":
                    variant === "primary",
                "text-dark group-hover:[&>svg>line]:stroke-light":
                    variant === "secondary",
            })}
        >
            {label}
        </span>
    </button>
);
