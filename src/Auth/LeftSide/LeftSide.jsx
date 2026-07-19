

export default function LeftSide( props ) {

    const { head , text , image } = props


    return (

<div className="w-full md:w-2/5 bg-[#4169E1] p-8 text-white flex flex-col items-center md:items-start"> 


            <h2 className="text-[29px] font-bold  mb-6 text-center md:text-left">{head}</h2> 

              <p className="mb-4 text-center md:text-left">{text}</p> 

            <div className="flex-grow flex items-center justify-center">
                <img
                    src={image}
                    alt="Login decoration"
                    className="max-w-full h-auto"
                />

            </div>

        </div>

);
}