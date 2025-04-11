'use client';

import { customRoles } from '@/lib/topics/custom-roles';

export function ImagePreloader() {
  return (
    <div className="hidden">
      {Object.entries(customRoles).map(([key, role]) => (
        <link
          key={key}
          rel="preload"
          as="image"
          href={`/images/topics/${role.img}`}
        />
      ))}
    </div>
  );
}
