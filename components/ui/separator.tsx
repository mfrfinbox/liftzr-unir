import * as React from 'react';

import { View } from 'react-native';

import * as SeparatorPrimitive from '@rn-primitives/separator';

import { SEPARATOR_STYLE } from '~/lib/constants/ui';
import { cn } from '~/lib/utils';

const Separator = React.forwardRef<SeparatorPrimitive.RootRef, SeparatorPrimitive.RootProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-muted/30',
        orientation === 'horizontal' ? 'h-[0.5px] w-full' : 'h-full w-[0.5px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

// Simple inline separator for common use cases
export const SimpleSeparator = ({ className }: { className?: string }) => (
  <View className={cn(SEPARATOR_STYLE, className)} />
);

export { Separator };
