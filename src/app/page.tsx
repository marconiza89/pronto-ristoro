import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  return (<>

    <div className="flex flex-col w-full h-[100svh] items-center justify-center">
      <Image className="w-1/4"
        src="/logos/pronto-ristoro.png"
        alt="Logo Pronto Ristoro"
        width={300}
        height={300}
      />
      <nav className="flex flex-row font-roboto tracking-wider text-mainblue items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm text-mainblue-light">
              Ciao, {user.email}
            </span>
            <Link href="/dashboard" className="px-4 py-2  font-medium border  border-mainblue-light rounded-md ">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2  font-medium border  border-mainblue-light rounded-md "            >
              Accedi
            </Link>
            <Link href="/signup" className="px-4 py-2  font-medium border  border-mainblue-light rounded-md ">
              Registrati
            </Link>
          </>
        )}
      </nav>
    </div>

  </>

  );
}




// function NavButtons() {
//   const supabase = createClient()
//   const { data: { user } } = await (await supabase).auth.getUser()
//   return (
//         <div className="font-sans min-h-screen">
//       {/* Header con navigazione */}
//       <header className=" text-mainblue  ">
//         <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <Image className="w-36"
//               src="/logos/pronto-ristoro.png"
//               alt="Logo Pronto Ristoro"
//               width={250}
//               height={250}
//             />
//             <div className="flex items-center">
//               <h1 className="text-2xl text-mainwhite font-bold tracking-tight ">
//                 PRONTO RISTORO
//               </h1>
//             </div>
//             <nav className="flex items-center space-x-4">
//               {user ? (
//                 <>
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     Ciao, {user.email}
//                   </span>
//                   <Link
//                     href="/dashboard"
//                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                   >
//                     Dashboard
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     href="/login"
//                     className="px-4 py-2 text-sm font-medium  hover:text-gray-900 dark:hover:text-white"
//                   >
//                     Accedi
//                   </Link>
//                   <Link
//                     href="/signup"
//                     className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-blue-700"
//                   >
//                     Registrati
//                   </Link>
//                 </>
//               )}
//             </nav>
//           </div>
//         </div>
//       </header>

//       {/* Contenuto principale */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">

//           </h2>


//           {!user && (
//             <div className="mt-8 flex justify-center space-x-4">
//               <Link
//                 href="/signup"
//                 className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//               >
//                 Inizia ora
//               </Link>
//               <Link
//                 href="/login"
//                 className="px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
//               >
//                 Hai già un account?
//               </Link>
//             </div>
//           )}
//         </div>

//         {/* Sezione features */}


//         {/* Sezione CTA */}

//       </main>
//     </div>
//   )

// function Hero() {
//   return (
//     <div className="flex w-full h-[100svh] items-center justify-center">
//       <Image className="w-1/4"
//         src="/logos/pronto-ristoro.png"
//         alt="Logo Pronto Ristoro"
//         width={300}
//         height={300}
//       />
//       <nav className="flex items-center space-x-4">
//         {user ? (
//           <>
//             <span className="text-sm text-gray-600 dark:text-gray-400">
//               Ciao, {user.email}
//             </span>
//             <Link
//               href="/dashboard"
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               Dashboard
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link
//               href="/login"
//               className="px-4 py-2 text-sm font-medium  hover:text-gray-900 dark:hover:text-white"
//             >
//               Accedi
//             </Link>
//             <Link
//               href="/signup"
//               className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-blue-700"
//             >
//               Registrati
//             </Link>
//           </>
//         )}
//       </nav>

//     </div>
//   )
// }