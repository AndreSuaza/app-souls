import { FieldProps } from "formik";
import Select, { ActionMeta, MultiValue, SingleValue } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps extends FieldProps {
  options: Option[];
  isMulti?: boolean;
  className?: string;
  placeholder?: string;
}

export const CustomSelect = ({
  className,
  placeholder,
  field,
  form,
  options,
  isMulti = false
}: CustomSelectProps) => {


  const onChange = (option:  MultiValue<Option> | SingleValue<Option>) => {
    form.setFieldValue(
      field.name,
      isMulti
        ? (option as Option[]).map((item: Option) => item.value)
        : (option as Option).value
    );
  };

  const getValue = () => {
    if (options) {
      return isMulti
        ? options.filter((option: Option) => field?.value?.indexOf(option.value) >= 0)
        : options.find((option: Option) => option.value === field.value);
    } else {
      return  [];
    }
  };

  return (
    <Select
      className={className}
      name={field.name}
      value={getValue()}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      isMulti={isMulti}
      defaultValue={[]}
    />
  );
};

export default CustomSelect;
