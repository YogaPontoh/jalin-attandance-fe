import "../app/globals.css";
import { BiLogOut, BiDownload } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserReport {
  id: number;
  name: string;
  department: string;
  date: string;
  check_in_time: string;
  check_in_photo: string;
  check_out_time: string;
  check_out_photo: string;
  hours_worked: string;
  overtime: string;
}

export async function getServerSideProps() {
  const res = await fetch("http://127.0.0.1:5001/users/report");
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

const AdminPage = () => {
  const [sortedData, setSortedData] = useState<UserReport[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchData(departmentFilter);
  }, [departmentFilter]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  const fetchData = async (department="") => {
    try {
      const url = department
      ? `http://127.0.0.1:5001/users/report?department=${encodeURIComponent(department)}`
      : "http://127.0.0.1:5001/users/report";

      const response = await fetch(url);
      const result = await response.json();

      setSortedData(
        [...result].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const url = departmentFilter
      ? `http://127.0.0.1:5001/users/report/download?department=${encodeURIComponent(departmentFilter)}`
      : "http://127.0.0.1:5001/users/report/download";

      const response = await fetch(
        url,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download the report.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `attendance_report_${departmentFilter || "all"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const fetchBase64 = async (filePath) => {
    try {
      if (sessionStorage.getItem(filePath)) {
        return sessionStorage.getItem(filePath); // 🔹 Gunakan cache jika ada
      }

      const response = await fetch(
        "http://127.0.0.1:5001/users/file-to-base64",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ file_path: filePath }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.file_base64;
      } else {
        console.error("Failed to fetch Base64");
        return null;
      }
    } catch (error) {
      console.error("Error fetching Base64:", error);
      return null;
    }
  };

  const ImageCell = ({ filePath }) => {
    const [base64Image, setBase64Image] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // Modal state

    useEffect(() => {
      if (filePath) {
        fetchBase64(filePath).then((base64) => {
          setBase64Image(base64);
        });
      }
    }, [filePath]);

    return (
      <div>
        {base64Image ? (
          <>
            {/* Thumbnail */}
            <img
              src={`data:image/jpeg;base64,${base64Image}`}
              alt="Check-in"
              className="w-16 h-16 object-cover rounded-lg cursor-pointer transition-transform duration-300 hover:scale-125"
              onClick={() => setIsOpen(true)}
            />

            {/* Popup Modal */}
            {isOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className="bg-white p-4 rounded-lg shadow-lg max-w-lg relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    ✖
                  </button>
                  <img
                    src={`data:image/jpeg;base64,${base64Image}`}
                    alt="Popup"
                    className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500">No Image</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="relative bg-primary p-4">
        <BiDownload
          className="absolute right-4 top-4 cursor-pointer"
          size={50}
          color="white"
          onClick={handleDownload}
        />
        <BiLogOut
          className="absolute left-4 top-4 cursor-pointer"
          size={50}
          color="white"
          onClick={handleLogout}
        />
        <h1 className="text-center text-6xl font-sans">Laporan Absensi</h1>
      </div>

      <div className="p-4">
        <label className="mr-2 text-lg font-bold text-blue-700">Filter Departemen:</label>
        <select
          className="p-3 border border-blue-400 bg-blue-100 text-blue-700 font-semibold rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md transition-all"
          value={departmentFilter}
          onChange={(e) => {
            console.log("Departemen yang dipilih:", e.target.value);
            setDepartmentFilter(e.target.value);
          }}
        >
          <option value="" className="bg-white text-blue-600">Semua</option>
          <option value="ATM Services & Product Management" className="bg-white text-blue-600">
            ATM Services & Product Management
          </option>
          <option value="Business Delivery Operation" className="bg-white text-blue-600">
            Business Delivery Operation
          </option>
          <option value="Commercial" className="bg-white text-blue-600">
            Commercial
          </option>
          <option value="Corporate Communication" className="bg-white text-blue-600">
            Corporate Communication
          </option>
          <option value="Corporate Secretary" className="bg-white text-blue-600">
            Corporate Secretary
          </option>
          <option value="Finance, Accounting & Tax" className="bg-white text-blue-600">
            Finance, Accounting & Tax
          </option>
          <option value="General Affairs" className="bg-white text-blue-600">
            General Affairs
          </option>
          <option value="Human Capital Management" className="bg-white text-blue-600">
            Human Capital Management
          </option>
          <option value="IT Governance & Management" className="bg-white text-blue-600">
            IT Governance & Management
          </option>
          <option value="IT Infrastructure & Services" className="bg-white text-blue-600">
            IT Infrastructure & Services
          </option>
          <option value="IT Security" className="bg-white text-blue-600">
            IT Security
          </option>
          <option value="Marketing Communication" className="bg-white text-blue-600">
            Marketing Communication
          </option>
          <option value="Officer Regional" className="bg-white text-blue-600">
            Officer Regional
          </option>
          <option value="Operation" className="bg-white text-blue-600">
            Operation
          </option>
          <option value="Sales & Account Management" className="bg-white text-blue-600">
            Sales & Account Management
          </option>
          <option value="Service & Contact Center" className="bg-white text-blue-600">
            Service & Contact Center
          </option>
          <option value="Switching & Digital Solution" className="bg-white text-blue-600">
            Switching & Digital Solution
          </option>
          <option value="Technology" className="bg-white text-blue-600">
            Technology
          </option>
          <option value="Transformation Management Office" className="bg-white text-blue-600">
            Transformation Management Office
          </option>
          <option value="Virtual ATM Solution" className="bg-white text-blue-600">
            Virtual ATM Solution
          </option>
        </select>
      </div>

      <div className="bg-white flex flex-col items-center flex-grow p-4">
        <div className="w-full overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-secondary">
                <th className="border border-gray-400 px-4 py-2">Name</th>
                <th className="border border-gray-400 px-4 py-2">Department</th>
                <th className="border border-gray-400 px-4 py-2">Date</th>
                <th className="border border-gray-400 px-4 py-2">
                  Check-in Time
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Check-in Photo
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Check-out Time
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Check-out Photo
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Durasi Jam Kerja
                </th>
                <th className="border border-gray-400 px-4 py-2">Lembur</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-200 text-black">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.department}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.check_in_time}
                  </td>
                  <td className="border border-gray-300 text-center flex align-middle items-center justify-center">
                    {item.check_in_photo ? (
                      <ImageCell filePath={item.check_in_photo} />
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.check_out_time || (
                      <span className="text-gray-500">Belum Checkout</span>
                    )}
                  </td>
                  <td className="border border-gray-300 text-center flex align-middle items-center justify-center ">
                    {item.check_out_photo ? (
                      <ImageCell filePath={item.check_out_photo} />
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.hours_worked || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {item.overtime || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-lg font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
