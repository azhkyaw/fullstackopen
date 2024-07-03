import { useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";

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
      <button onClick={() => toggleVisibility()}>cancel</button>
    </>
  );
});

Togglable.displayName = "Togglable";

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
};

export default Togglable;
