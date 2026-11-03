import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="M6 21h12m-10-2h8l-1.2-3h-5.6L8 19Zm1.5-5a4.5 4.5 0 0 1 9 0v1h-9v-1Z" />
            <path d="M12 3v2M5 6l1.5 1.5M19 6l-1.5 1.5" />
            <circle cx="12" cy="13.5" r="1.5" />
        </svg>
    );
}
