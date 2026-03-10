import { useRole } from "../contexts/RoleContext";
import OneOnOnePlanner from "./OneOnOnePlanner";
import MemberPrep from "./MemberPrep";

const PrepRouter: React.FC = () => {
  const { role } = useRole();
  return role === "member" ? <MemberPrep /> : <OneOnOnePlanner />;
};

export default PrepRouter;
