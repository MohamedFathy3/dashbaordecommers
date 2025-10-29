// components/ui/chart.tsx
'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children']
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid]:stroke-border/50 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line]:stroke-border [&_.recharts-sector]:stroke-transparent [&_.recharts-surface]:outline-none [&_.recharts-polar-angle-axis-tick_text]:fill-foreground [&_.recharts-polar-radius-axis-tick_text]:fill-foreground",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'Chart'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

// Define proper types for tooltip payload
interface TooltipPayloadItem {
  dataKey?: string;
  name?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  color?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  label?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labelFormatter?: (value: any, payload: TooltipPayloadItem[]) => string;
  labelClassName?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any, name: string, item: TooltipPayloadItem, index: number, payload: TooltipPayloadItem[]) => string;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload || !payload.length) {
        return null
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalLabel: any
      if (labelKey && payload[0] && payload[0].payload) {
        finalLabel = payload[0].payload[labelKey]
      } else {
        finalLabel = label
      }

      if (labelFormatter && finalLabel != null) {
        return labelFormatter(finalLabel, payload)
      }

      if (finalLabel != null && typeof finalLabel === 'string') {
        return finalLabel
      }

      return null
    }, [hideLabel, label, labelFormatter, payload, labelKey])

    if (!active || !payload || !payload.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== 'dashed'

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!nestLabel && tooltipLabel && (
          <div
            className={cn(
              'font-medium text-gray-900 dark:text-white',
              labelClassName
            )}
          >
            {tooltipLabel}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item: TooltipPayloadItem, index: number) => {
            const key = `${nameKey || item.dataKey || item.name || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                  indicator === 'dashed' && 'items-center'
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                      {
                        'h-2.5 w-2.5': indicator === 'dot',
                        'w-0 border-[1.5px] border-dashed bg-transparent':
                          indicator === 'dashed',
                        'my-0.5': indicator === 'dashed' && nestLabel,
                      }
                    )}
                    style={
                      {
                        '--color-bg': indicatorColor,
                        '--color-border': indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    'flex flex-1 justify-between gap-2 leading-none',
                    nestLabel ? 'items-end' : 'items-center'
                  )}
                >
                  <div className="grid gap-1.5">
                    {nestLabel && tooltipLabel && (
                      <div
                        className={cn(
                          'font-medium text-gray-900 dark:text-white',
                          labelClassName
                        )}
                      >
                        {tooltipLabel}
                      </div>
                    )}
                    <span className="text-gray-600 dark:text-gray-400">
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                  {item.value != null && (
                    <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-white">
                      {formatter && item.name
                        ? formatter(item.value, item.name, item, index, payload)
                        : item.value}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltip'

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (payload as any)[key] === 'string' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload as any)[key] in config
  ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configLabelKey = (payload as any)[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (payloadPayload as any)[key] === 'string' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payloadPayload as any)[key] in config
  ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configLabelKey = (payloadPayload as any)[key]
  }

  return config[configLabelKey]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle,
}