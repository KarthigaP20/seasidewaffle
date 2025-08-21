export default function Footer() {
  return (
    <footer className="bg-yellow-800 py-4 ">
      <div className="max-w-7xl mx-auto text-center text-gray-800 font-medium">
        © {new Date().getFullYear()} Sea Side Waffle. All rights reserved.
      </div>
    </footer>
  );
}
