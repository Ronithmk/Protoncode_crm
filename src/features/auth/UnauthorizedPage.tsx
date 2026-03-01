import { Card, Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <Card className="p-8 text-center max-w-md">
        <h1 className="text-xl font-bold text-primary mb-2">
          Access Denied
        </h1>

        <p className="text-secondary text-sm mb-6">
          You do not have permission to access this page.
        </p>

        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
};