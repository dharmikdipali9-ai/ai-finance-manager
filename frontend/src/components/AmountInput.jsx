import { useState, useEffect } from "react";

function AmountInput({
  value = "",
  onChange,
  placeholder = "Enter amount",
  className = "",
  style = {}
}) {
  const [display, setDisplay] = useState("");

  const format = (val) => {
    if (!val) return "";
    return new Intl.NumberFormat("en-IN").format(val);
  };

  useEffect(() => {
    setDisplay(value ? format(value) : "");
  }, [value]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/,/g, "");

    if (raw === "") {
      setDisplay("");
      onChange("");
      return;
    }

    if (!isNaN(raw)) {
      setDisplay(format(raw));
      onChange(raw);
    }
  };
  

  return (
    <input
      type="text"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={`form-control ${className}`}
      style={style}
    />
  );
}

export default AmountInput;