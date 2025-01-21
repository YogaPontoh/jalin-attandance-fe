import "../app/globals.css";
import { BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation";

interface UserReport {
  id: number;
  username: string;
  check_in_time: string;
  check_in_photo: string;
  check_out_time: string;
  check_out_photo: string;
}

export async function getServerSideProps() {
  // Fetch data dari API
  const res = await fetch("http://127.0.0.1:5001/users/report");
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

const AdminPage = ({ data }: { data: UserReport[] }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");

    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink flex flex-row items-center justify-center bg-primary">
        <BiLogOut
          className="flex flex-shrink ml-6"
          size={50}
          color="white"
          onClick={handleLogout}
        />
        <h1 className="flex-grow flex text-6xl font-sans p-4 justify-center">
          Admin Dashboard
        </h1>
      </div>
      <div className="bg-white flex justify-center flex-grow">
        <div className="flex justify-center items-center pt-4">
          <table className="table-auto border-collapse border">
            <thead>
              <tr className=" text-secondary">
                <th className="border border-blue-500 px-4 py-2 text-left">
                  Username
                </th>
                <th className="border border-blue-500 px-4 py-2 text-left">
                  Checkin Time
                </th>
                <th className="border border-blue-500 px-4 py-2 text-left">
                  Checkin Photo
                </th>
                <th className="border border-blue-500 px-4 py-2 text-left">
                  Checkout Time
                </th>
                <th className="border border-blue-500 px-4 py-2 text-left">
                  Checkout Photo
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-200 text-black">
                  <td className="border border-blue-400 px-4 py-2">
                    {item.username}
                  </td>
                  <td className="border border-blue-400 px-4 py-2">
                    {item.check_in_time}
                  </td>
                  <td className="border border-blue-400 px-4 py-2">
                    {item.check_in_photo}
                  </td>
                  <td className="border border-blue-400 px-4 py-2">
                    {item.check_out_time}
                  </td>
                  <td className="border border-blue-400 px-4 py-2">
                    {item.check_out_photo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
