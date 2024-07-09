import { useState } from "react";
import PropTypes from "prop-types";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onLogin({ username, password });

    setUsername("");
    setPassword("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        username:
        <input
          data-testid="username"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password:
        <input
          data-testid="password"
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
};

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginForm;
