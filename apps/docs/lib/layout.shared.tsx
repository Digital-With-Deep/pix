import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- 20px inline SVG mark; next/image adds nothing with images.unoptimized */}
          <img src="/pix-mark.svg" alt="" width={20} height={20} style={{ borderRadius: 4 }} />
          <span style={{ fontWeight: 600 }}>{appName}</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
