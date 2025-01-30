import "../app/globals.css";
import { useEffect, useRef, useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation";

interface UserData {
  id: number;
  username: string;
  role: string;
}

const UserPage = () => {
  const [data, setData] = useState<UserData | null>(null);
  const [uploadImagePath, setUploadImagePath] = useState<object | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(new Date());

  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    const getWebcamStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    getWebcamStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (data?.id) {
      attandanceStatus();
    }
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const takePhoto = async (): Promise<string | null> => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
      }
    }
    return null;
  };

  const uploadPhoto = async (
    imageBase64: string,
    type: string
  ): Promise<string | null> => {
    try {
      const base64Response = await fetch(imageBase64);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append("file", blob, `${type}-${Date.now()}.png`);

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
      return data?.file_path || null;
    } catch (error) {
      console.error("Error uploading photo:", error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const attandanceStatus = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/users/attendance-status?user_id=${data?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setIsCheckedIn(result.last_checkin ? result.last_checkin : false)
          setIsCheckedOut(result.last_checkout ? result.last_checkin : false)
        } else {
          console.error("Failed to fetch attendance status");
        }
      } catch (error) {
        console.error("Error:", error);
      }
  };

  const checkin = async () => {
    if (isCheckedIn) {
      alert("You have already checked in today.");
      return;
    }

    const photoBase64 = await takePhoto();
    if (!photoBase64) {
      alert("Failed to capture photo.");
      return;
    }

    const photoPath = await uploadPhoto(photoBase64, "Check-in");
    if (!photoPath) {
      alert("Failed to upload photo.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/users/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data?.id,
          photo_path: photoPath,
        }),
      });

      if (response.ok) {
        setIsCheckedIn(true);
        localStorage.setItem("checkedIn", "true");
        alert("Check-in successful!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to check-in");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const checkout = async () => {
    if (isCheckedOut) {
      alert("You have already checked out today.");
      return;
    }

    const photoBase64 = await takePhoto();
    if (!photoBase64) {
      alert("Failed to capture photo.");
      return;
    }

    const photoPath = await uploadPhoto(photoBase64, "Check-out");
    if (!photoPath) {
      alert("Failed to upload photo.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/users/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data?.id,
          photo_path: photoPath,
        }),
      });

      if (response.ok) {
        setIsCheckedOut(true);
        localStorage.setItem("checkedOut", "true");
        alert("Check-out successful!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to check-out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
        {data?.username ? (
          <h1 className="flex-grow flex text-6xl font-sans p-4 justify-center">
            {data.username}
          </h1>
        ) : (
          <h1 className="flex-grow flex text-6xl font-sans p-4 justify-center">
            Loading...
          </h1>
        )}
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
            className="bg-primary border rounded-2xl p-5 font-sans text-white hover:text-black hover:bg-white transition-all"
            onClick={checkin}
            disabled={isCheckedIn}
          >
            {isCheckedIn ? "Already Checked In" : "Check In"}
          </button>
        </div>
        <div className="flex-grow justify-center flex">
          <button
            className="bg-primary border rounded-2xl p-5 font-sans text-white hover:text-black hover:bg-white transition-all"
            onClick={checkout}
            disabled={isCheckedOut}
          >
            {isCheckedOut ? "Already Checked Out" : "Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
