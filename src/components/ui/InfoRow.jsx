export default function InfoRow ({label, value}) {
    return(
        <div className="flex flex-col text-sm py-1 mb-6">
            <span className="text-gray-500 w-40">{label}</span>
            <span className="text-gray-800 font-medium">{value}</span>
        </div>
    );
}