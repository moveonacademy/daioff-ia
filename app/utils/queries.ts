import crypto from "crypto";
import { prisma } from "./prisma.server";
import { getAuthFromRequest } from "./auth";


export async function accountExists(email: string) {
  let account = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  return Boolean(account);
}

export async function createAccount(email: string, password: string,firstName: string, lastName: string, ) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");

  return prisma.user.create({
    data: {
      email: email,
      firstName: firstName,
      lastName: lastName,

      password: {
        create: {
          hash,
          salt,
        },
      },    },
  });
}
export async function login(email: string, password: string) {
  // Encuentra al usuario junto con su registro de contraseña
  let user = await prisma.user.findUnique({
    where: { email: email },
    include: {
      password: true, // Asegura que el campo 'password' sea incluido en el resultado
    },
  });

  if (!user || !user.password) {
    // Si el usuario no existe o no tiene una contraseña asignada, retorna false
    return false;
  }

  // Genera el hash usando la misma sal almacenada en el campo
  let hash = crypto
    .pbkdf2Sync(password, user.password.salt, 1000, 64, "sha256")
    .toString("hex");

  // Verifica si el hash generado coincide con el almacenado
  if (hash !== user.password.hash) {
    return false;
  }

  // Devuelve el identificador del usuario si las contraseñas coinciden
  return user.id;
}



export async function getEmail(request: Request): Promise<string | null> {
  let userId = await getAuthFromRequest(request);

  if (!userId) {
    return null; // Return null if no user ID is found in the cookies
  }

  // Assuming the ID is used directly to fetch the email
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },  // No need to parse as integer if ID is a string
    select: { email: true }  // Select only the email field
  });

  return user?.email ?? null;
}

export async function getUserProfile(request: Request) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
      return null;
  }

  // Fetch user details using Prisma
  const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },  // Adjust based on your ID type, string or number
      select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          gender: true,
          birthday: true
      }
  });

  return user;
}

export async function saveProfile(email:string,firstName: string, lastName: string, bio: string, gender: string,birthday: Date,avatar: string) {
  // Encuentra al usuario junto con su registro de contraseña
  let user = await prisma.user.findUnique({
    where: { email: email },
   
  });

  if (!user ) {
    // Si el usuario no existe o no tiene una contraseña asignada, retorna false
    return false;
  } 
   const updatedUser = await prisma.user.update({
    where: { email: email },
    data: {
      firstName: firstName,
      lastName: lastName,
      bio: bio,
      gender: gender,
      birthday:birthday,
      avatar:avatar


    },
  });

  return updatedUser;
}
export async function getUserDetails(request: Request) {
  // Extract user ID from the request using your authentication utility
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    // Return null if no user ID is found to indicate no user is logged in
    return null;
  }

  // Fetch user details from your database using Prisma
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      profession: true, // Assuming you want to include more details like profession
      community: true,
      city: true,
      province: true,
      address: true,
      // You can add more fields as required
    }
  });

  // Return user details or null if user not found
  return user || null;
}

export async function saveDetails(contractDetails, request) {
  const { profession, community, city, province, address } = contractDetails;
  const userId = await getAuthFromRequest(request);

  if (!userId) {
    return false;
  }

  const userExists = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!userExists) {
    return false;
  }

  const updatedUserDetails = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      profession,
      community,
      city,
      province,
      address,
    },
  });

  return updatedUserDetails;
}
export async function saveContractDetails(contractDetails, request) {
  const {
    startDate,
    endDate,
    contractType,
    trialPeriod,
    workdayType,
    weeklyHours,
    netSalary,
    grossSalary,
    extraPayments,
    sector,
    cotizationGroup
  } = contractDetails;

  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return null;
  }

  let userExists = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { id: true }
  });

  if (!userExists) {
    return false;
  }

  // Ensure that 'trialPeriod' is treated as a boolean for database consistency
  const trialPeriodBool = trialPeriod === 'yes';

  const updatedContractDetails = await prisma.contract.upsert({
    where: { userId: parseInt(userId) },
    update: {
      startDate:startDate,
      endDate: endDate ,
      contractType,
      trialPeriod: trialPeriodBool,
      workdayType,
      weeklyHours: parseFloat(weeklyHours),
      netSalary: parseFloat(netSalary),
      grossSalary: parseFloat(grossSalary),
      extraPayments: parseInt(extraPayments),
      sector,
      cotizationGroup
    },
    create: {
      userId: parseInt(userId),
      startDate: startDate,
      endDate: endDate,
      contractType,
      trialPeriod: trialPeriodBool,
      workdayType,
      weeklyHours: parseFloat(weeklyHours),
      netSalary: parseFloat(netSalary),
      grossSalary: parseFloat(grossSalary),
      extraPayments: parseInt(extraPayments),
      sector,
      cotizationGroup
    }
  });

  return updatedContractDetails;
}
export async function fetchUserContractDetails(request) {
  const userId = await getAuthFromRequest(request); // Function to authenticate and extract user ID from request
  if (!userId) {
    return null;
  }

  // Fetch contract details using Prisma
  const contractDetails = await prisma.contract.findUnique({
    where: { userId: parseInt(userId) }, // Adjust based on your ID type, string or number
    select: {
      startDate: true,
      endDate: true,
      contractType: true,
      trialPeriod: true,
      workdayType: true,
      weeklyHours: true,
      netSalary: true,
      grossSalary: true,
      extraPayments: true,
      sector: true,
      cotizationGroup: true
    }
  });

  return contractDetails;
}