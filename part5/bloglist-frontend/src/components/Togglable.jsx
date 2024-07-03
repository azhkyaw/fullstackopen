import { useState, forwardRef, useImperativeHandle } from "react";

const Togglable = forwardRef(({ buttonLabel, children }, refs) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible(!visible);

  useImperativeHandle(refs, () => {
    return { toggleVisibility };
  });

  return !visible ? (
    <button onClick={() => toggleVisibility()}>{buttonLabel}</button>
  ) : (
    <>
      {children}
      <button onClick={() => toggleVisibility()}>Cancel</button>
    </>
  );
});

export default Togglable;
