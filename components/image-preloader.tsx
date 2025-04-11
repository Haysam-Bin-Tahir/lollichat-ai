'use client';

import Image from 'next/image';
import { customRoles } from '@/lib/topics/custom-roles';

export function ImagePreloader() {
  return (
    <div className="hidden">
      {Object.entries(customRoles).map(([key, role]) => (
        <Image
          key={key}
          src={`/images/topics/${role.img}`}
          alt=""
          width={100}
          height={100}
          priority
          onLoad={() => {
            // Image is now cached in browser
            console.debug(`Preloaded: ${role.img}`);
          }}
        />
      ))}
    </div>
  );
}
