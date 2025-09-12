// import { Lightbulb, FileText, BarChart3 } from 'lucide-react'
import { Plus } from 'lucide-react'
// import { Text, TextType } from '@ui/components/atomic/atoms/text/text'
import { useNavigate } from 'react-router-dom'
import { useUserContext } from "../../context/UserContext";

interface Feature {
  name: string
  slug: string
  icon: React.ElementType
  color: string
}

interface FeaturesSectionProps {
  onViewChange: (view: "chat" | "ai-proposal" | "self-analytics") => void;
  isCollapsed?: boolean;
}

const allFeatures: Feature[] = [
  {
    name: 'New Chat',
    slug: 'chat',
    icon: Plus,
    color: 'bg-[#0971EB] text-white',
  },
  // {
  //   name: 'AI Proposal',
  //   slug: 'ai-proposal',
  //   icon: FileText,
  //   color: 'bg-[#0971EB] text-white',
  // },
  // {
  //   name: 'Self Analytics',
  //   slug: 'self-analytics',
  //   icon: BarChart3,
  //   color: 'bg-[#0971EB] text-white',
  // },
]

export function FeaturesSection({
  // isCollapsed = false,
  onViewChange,
}: FeaturesSectionProps) {
  const navigate = useNavigate()
  const { access } = useUserContext();

  console.log(onViewChange)

  const allowedSlugs = access?.features ?? [];

  const featuresToShow = allFeatures.filter((f) =>
    allowedSlugs.includes(f.slug)
  );

  const handleFeatureClick = (slug: string) => {
    navigate(`/app/${slug}`)
  }

  return (
    <div
      className="
        p-1 sm:p-2 md:p-3 
        border-t border-gray-100 dark:border-gray-700 
        flex-shrink-0
        min-h-auto
      "
    >
      {/* {!isCollapsed && (
        <Text
          type={TextType.paragraph}
          text="Features"
          className="text-xs sm:text-sm mb-1"
        />
      )} */}
      <div className="space-y-0.5 sm:space-y-1">
        
        {featuresToShow.map((feature) => (
          <div
            key={feature.slug}
            className={`
              flex items-center rounded-md transition-all duration-500 ease-in-out
              hover:bg-primary hover:text-black hover:shadow border border-primary
              dark:hover:bg-gray-700 cursor-pointer justify-center
              h-6 sm:h-7 md:h-8 md:mr-1 px-0.5 sm:px-1 mt-2
              group
            `}
            onClick={() => handleFeatureClick(feature.slug || "")}
            title={feature.name}
          >
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            <feature.icon className="w-4 h-4 sm:w-4 sm:h-4 text-primary group-hover:text-white" />
            </div>
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out items-center 
              `}
            >
              <span className="text-xs sm:text-sm whitespace-nowrap text-primary group-hover:text-white">
                {feature.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}