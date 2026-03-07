type Tab = {
    label: string;
    value: string;
};

type TabGroupProps = {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (value: string) => void;
    accentColor?: "green" | "amber" | "blue";
};

const accentStyles = {
    green:
        "border-green-600 text-green-700",
    amber:
        "border-amber-600 text-amber-700",
    blue:
        "border-blue-600 text-blue-700",
};

export default function TabGroup({
    tabs,
    activeTab,
    onTabChange,
    accentColor = "green",
}: TabGroupProps) {
    return (
        <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.value
                            ? `border-b-2 ${accentStyles[accentColor]}`
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
