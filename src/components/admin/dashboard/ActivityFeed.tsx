import type { ActivityItem } from '../../../types/admin'

interface ActivityFeedProps {
  activities?: ActivityItem[]
}

export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {

  const getDotColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return 'bg-success ring-emerald-100'
      case 'sms': return 'bg-amber-500 ring-amber-100'
      case 'voucher': return 'bg-blue-500 ring-blue-100'
      case 'system': return 'bg-red-500 ring-red-100'
      default: return 'bg-gray-500 ring-gray-100'
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[420px]">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Live Activity Feed</h3>
        <p className="text-xs text-gray-400">Real-time status updates and order notifications</p>
      </div>

      <div className="flex-1 mt-4 overflow-y-auto pr-1 scrollbar space-y-4">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 text-xs group">
            {/* Status Indicator Dot */}
            <div className="relative mt-1 shrink-0">
              <span className={`block w-2.5 h-2.5 rounded-full ring-4 ${getDotColor(item.type)} transition-transform group-hover:scale-125`} />
            </div>

            {/* Content Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-text-primary group-hover:text-primary transition-colors">
                  {item.message}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold shrink-0 ml-2">
                  {item.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
