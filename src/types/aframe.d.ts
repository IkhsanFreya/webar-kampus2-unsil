declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'mindar-image'?: string;
        'color-space'?: string;
        renderer?: string;
        'vr-mode-ui'?: string;
        'device-orientation-permission-ui'?: string;
        embedded?: boolean | string;
      };
      'a-assets': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'a-asset-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
      };
      'a-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: string;
        'look-controls'?: string;
        raycaster?: string;
        cursor?: string;
      };
      'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'mindar-image-target'?: string;
        'pin-interactive'?: string;
        position?: string;
        rotation?: string;
        scale?: string;
        geometry?: string;
        material?: string;
        animation?: string;
        class?: string;
      };
      'a-plane': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        position?: string;
        rotation?: string;
        width?: string | number;
        height?: string | number;
        material?: string;
        color?: string;
        class?: string;
      };
      'a-ring': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: string;
        rotation?: string;
        'radius-inner'?: string | number;
        'radius-outer'?: string | number;
        color?: string;
        material?: string;
        animation?: string;
        class?: string;
      };
      'a-circle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: string;
        rotation?: string;
        radius?: string | number;
        color?: string;
        material?: string;
        class?: string;
        'pin-interactive'?: string;
      };
      'a-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        position?: string;
        rotation?: string;
        scale?: string;
        color?: string;
        align?: string;
        width?: string | number;
        side?: string;
        class?: string;
      };
    }
  }
}

export {};
