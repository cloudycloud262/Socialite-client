import { useRef, FC, ChangeEvent } from "react";

type TextAreaProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxLength?: number;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

const Textarea: FC<TextAreaProps> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const changeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e.target.value);
    e.target.style.height = "auto";
    if (e.target.scrollHeight > e.target.clientHeight) {
      e.target.style.height = `${e.target.scrollHeight - 4}px`;
    }
  };

  return (
    <textarea
      value={props.value}
      className={props.className}
      onChange={changeHandler}
      rows={1}
      placeholder={props.placeholder}
      ref={ref}
      maxLength={props.maxLength}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
};

export default Textarea;
