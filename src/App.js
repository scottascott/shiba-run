import CryptoShibaRun from "./components/CryptoShibaRun";
function imageFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result); // base64 string
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
}
function App() {
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "50px" }}>
            <CryptoShibaRun />
            {/* <div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const base64 = await imageFileToBase64(file);
                        console.log(base64);
                    }}
                />
            </div> */}
        </div>
    );
}

export default App;
