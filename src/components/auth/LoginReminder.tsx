import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LoginReminder() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
}
