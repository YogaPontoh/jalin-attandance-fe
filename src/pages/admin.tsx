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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/users/report");
      const result = await response.json();
      console.log(result);

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
      const response = await fetch(
        "http://127.0.0.1:5001/users/report/download",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download the report.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_report.xlsx";
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
              onClick={() => setIsOpen(true)} // Klik untuk membuka modal
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
