import { useCallback, useEffect, useRef, useState } from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled: disabledProp = false,
  isLoading,
  showLoaderOnClick = true,
  loaderPosition = "start",
  disableWhileLoading = true,
  onClick,
  ...rest
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const base =
    "inline-flex justify-center items-center font-medium rounded-md transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const loaderSizeClass = {
    sm: "h-3.5 w-3.5 border",
    md: "h-4 w-4 border-2",
    lg: "h-5 w-5 border-2",
  }[size] || "h-4 w-4 border-2";

  const computedLoading = isLoading ?? internalLoading;
  const computedDisabled = disabledProp || (disableWhileLoading && computedLoading);

  const handleClick = useCallback(
    (event) => {
      if (!onClick || (disableWhileLoading && computedLoading)) return;

      const maybePromise = onClick(event);
      const isPromise = showLoaderOnClick && maybePromise?.then;

      if (isPromise) {
        setInternalLoading(true);
        Promise.resolve(maybePromise)
          .catch(() => null)
          .finally(() => {
            if (isMountedRef.current) {
              setInternalLoading(false);
            }
          });
      }
    },
    [computedLoading, disableWhileLoading, onClick, showLoaderOnClick]
  );

  const loader = (
    <span
      className={`inline-flex ${loaderSizeClass} border-current/60 border-t-transparent rounded-full animate-spin`}
      aria-hidden="true"
    />
  );

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={computedDisabled}
      aria-busy={computedLoading}
      aria-live="polite"
      onClick={handleClick}
      {...rest}
    >
      {computedLoading && loaderPosition === "start" && loader}
      <span className={computedLoading ? "opacity-90" : ""}>{children}</span>
      {computedLoading && loaderPosition === "end" && loader}
    </button>
  );
}