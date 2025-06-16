import { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/hooks/use-rbac';
import { ResourceType, PermissionAction } from '@/types/rbac';

interface WithPermissionProps {
  resource: ResourceType;
  action: PermissionAction;
  fallbackPath?: string;
}

export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  { resource, action, fallbackPath = '/unauthorized' }: WithPermissionProps
) {
  return function PermissionWrapper(props: P) {
    const router = useRouter();
    const { checkPermission } = useRBAC();

    if (!checkPermission(resource, action)) {
      router.push(fallbackPath);
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Usage example:
// const ProtectedComponent = withPermission(MyComponent, {
//   resource: ResourceType.COURSE,
//   action: PermissionAction.CREATE
// }); 