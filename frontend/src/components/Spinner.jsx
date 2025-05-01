import PropTypes from "prop-types";

export default function Spinner({ size = 4, color = "white" }) {
  const pixelSize = `${size}px`;

  return (
    <div
      className="animate-spin rounded-full border-4 border-t-transparent"
      style={{
        height: pixelSize,
        width: pixelSize,
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};
