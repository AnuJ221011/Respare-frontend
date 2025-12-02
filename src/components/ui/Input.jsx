export default function Input({label, type="text", className = "", ...props}) {
    return (
        <div>
            {label && <label className="text-sm text-gray-600">{label}</label>}
            <input
                type={type}
                className={`${className}`}
                {...props}
            />
        </div>

    );

}