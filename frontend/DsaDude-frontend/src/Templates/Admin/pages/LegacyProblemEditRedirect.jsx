import { Navigate, useParams } from "react-router-dom";

const LegacyProblemEditRedirect = () => {
  const { id } = useParams();

  return <Navigate to={`/admin/problems/${id}`} replace />;
};

export default LegacyProblemEditRedirect;