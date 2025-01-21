import "../app/globals.css";
import { useEffect, useRef, useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation";

const UserPage = () => {
  const [data, setData] = useState<object | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(new Date());
  const [capturedImages, setCapturedImages] = useState<
    { type: string; image: string }[]
  >([]);

  const router = useRouter();

  const uploadPhoto = async (imageBase64: string, type: string) => {
    try {
      // Konversi base64 ke Blob
      const base64Response = await fetch(imageBase64);
      const blob = await base64Response.blob();

      // Buat FormData
      const formData = new FormData();
      formData.append("file", blob, `${type}-${Date.now()}.png`); // Beri nama file unik

      // Kirim permintaan ke server
      const response = await fetch("http://127.0.0.1:5001/users/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.log(response);
        
        throw new Error("Failed to upload photo ");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");

    router.push("/");
  };

  const captureImage = (type: string) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImages((prev) => [...prev, { type, image: dataUrl }]);
      }
    }
  };

  const checkin = async (type: string) => {
    captureImage(type);
    console.log(localStorage);
    // Ambil gambar terakhir dari capturedImages
    const latestImage = capturedImages[capturedImages.length - 1];
    if (latestImage) {
      await uploadPhoto(latestImage.image, type); // Upload gambar
    }
  };

  const checkout = (type: string) => {
    captureImage(type);
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("user"));
    setData(storedData);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          {data?.username ? data?.username : ""}
        </h1>
      </div>
      <div className="flex flex-row flex-grow">
        <div className="flex-grow flex items-center justify-center gap-3 flex-col text-secondary bg-white shadow-lg shadow-black-500/70">
          <p className="text-2xl mt-4">
            {time.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-7xl font-mono mt-2">
            {time.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="border rounded-lg shadow-lg shadow-black-500/70"
            ></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-shrink pb-36 bg-white">
        <div className="flex-grow bg-white justify-center flex">
          <button
            className="bg-primary border rounded-2xl p-5 font-sans text-white hover:text-black hover:bg-white transition-all shadow-lg shadow-black-500/70"
            onClick={() => checkin("Check-in")}
          >
            Check-in
          </button>
        </div>
        <div className="flex-grow justify-center flex">
          <button
            className="bg-primary border rounded-2xl p-5 font-sans text-white hover:text-black hover:bg-white transition-all shadow-lg shadow-black-500/70"
            onClick={() => checkout("Check-out")}
          >
            Check-out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
