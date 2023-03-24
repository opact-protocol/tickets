
export const If = ({
  children,
  condition,
  fallback = null,
}) => {
  return ( condition ? children : fallback || null );
};
