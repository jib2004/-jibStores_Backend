import otpGenerator from 'otp-generator'

export const generateToken = () =>{
    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        specialChars: false,
        lowerCaseAlphabets:false 
    });
   
    return otp
}

 