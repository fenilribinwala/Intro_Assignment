import { PrismaClient, User, UserWalletItem } from '@prisma/client'
import process from 'process';
const prisma = new PrismaClient()

interface UserWithRelations extends User {
	userWallet: {
		walletBalance: number;
	};
	userWalletItem: UserWalletItem[];
}

/*  Part I
	Input: array of Users
	Output: array of email addresses (i.e. array of strings)
 */
function validateWalletItems(data: any): string[] {
	const validation: string[] = []; 
	//Write your code here
	data.forEach((user: UserWithRelations) => {
		const { email, userWallet, userWalletItem } = user;
		const credits = userWalletItem.filter((item: any) => item.type === 'credit').reduce((sum: number, item: any) => sum + item.amount, 0);
		const debits = userWalletItem.filter((item: any) => item.type === 'debit').reduce((sum: number, item: any) => sum + item.amount, 0);
		const walletBalance = userWallet.walletBalance;
		if (credits - debits !== walletBalance) {
			validation.push(email);
		}
	});
	// this function returning [ 'alex@movingcompany.com' ]
	return validation;
}

/*  Part II
	Input: array of Users
	Output: total admin cash given out in dollars (i.e. number)
 */
function calculateAdminCash(data: any): number {
	let totalAmount: number = 0;
	//Write your code here
	data.forEach((user: UserWithRelations) => {
		const adminCashItems = user.userWalletItem.filter(item => item.description === 'adminCash' && item.type === 'credit');
		totalAmount += adminCashItems.reduce((sum, item) => sum + item.amount, 0);
	})
	// this function returning 45
	return totalAmount / 100;
}

/*  Part III
	Complete the query that is used here:
	await prisma.user.findMany(query1);
 */
const query1 = {
	//Write your code here
	where: {
		active: true,
		createdAt: {
			gte: new Date('2022-12-01T00:00:00.000Z'),
			lte: new Date('2022-12-31T23:59:59.999Z')
		},
		classification: {
			contains: 'logistics'
		}
	},
	include: {
		userWallet: true,
		userWalletItem: false
	}
}

/*  Part IV
	Complete the query that is used here:
	await prisma.user.update(query2);
 */
const query2 = {
	//Write your code here
	where: {
		email: 'alex@movingcompany.com'
	},
	data: {
		userWallet: {
			update: {
				walletBalance: {
					decrement: 1280
				}
			}
		},
		userWalletItem: {
			create: {
				type: 'debit',
				amount: 1280,
				description: ''
			}
		}
	}
}

/***********************************
 * DO NOT MODIFY ANY CODE BELOW HERE
 ***********************************/
const user1 = {
    data: {
		businessName: 'ABC Logistics',
		email: 'rishi@ABC.com',
		ownerName: 'rishi jain',
		classification: 'logistics company',
		active: false,
		userWallet: {
			create: {
				walletBalance: 2000, //stored in cents
			}
		},
		userWalletItem: 
		{
			create: [
				{
				type: 'credit',
				amount: 2000,
				description: 'adminCash',
				}
			]
		},
    },
};

const user2 = {
    data: {
		businessName: 'Moving Company',
		email: 'alex@movingcompany.com',
		ownerName: 'Alex Kroney',
		classification: 'last mile logistics',
		active: true,
		userWallet: {
			create: {
				walletBalance: 2500,
			}
		},
		userWalletItem: 
		{
			create: [
				{
				type: 'credit',
				amount: 2500, 
				description: 'adminCash',
				},
				{
				type: 'debit',
				amount: 2200, 
				description: '', //when type = 'debit', description is empty
				},
				{
				type: 'credit',
				amount: 2200, 
				description: 'cash', 
				}
			]
		},
    },
};

async function main() {
	/* The following was originally used to create the 2 users
	await prisma.user.create(user1);
	await prisma.user.create(user2);
	*/
	const users = await prisma.user.findMany({
		include: {
      		userWallet: true,
      		userWalletItem: true,
    	},
	})
	validateWalletItems(users);
	calculateAdminCash(users);
	const queried = await prisma.user.findMany(query1);
	console.log(queried);
	const updated = await prisma.user.update(query2);
	console.log(updated);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
