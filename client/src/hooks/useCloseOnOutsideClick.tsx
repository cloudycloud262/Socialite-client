import { useEffect } from "react";

const useCloseOnOutsideClick = (
  ref: React.MutableRefObject<HTMLDivElement | null>,
  func: Function
): void => {
  useEffect(() => {
    const el = ({ target }: MouseEvent): void => {
      if (ref) {
        const eventTarget = target as HTMLElement;
        if (!ref.current?.contains(eventTarget)) {
          func(eventTarget);
        }
      }
    };
    document.body.addEventListener("click", el);
    return () => {
      document.body.removeEventListener("click", el);
    };
  }, []);
};

export default useCloseOnOutsideClick;
