1. 
- **Fayl:** product.service
- **Simptom:** page skip qilish xato
- **Sabab:** .skip(page * limit) 
- **Tuzatish:** .skip((page - 1) * limit)
- **Qanday tekshirdim:** oldinggi debugging qilganimizdaham shunaqa xato bor edi shundan bildim

2. //--------------------------

- **Fayl:** product.service
- **Simptom:** findOne da mahsulot topilmasa null qaytaradi lekin controllerda statusCode 200 qaytadi
- **Sabab:** qaytvotgan datani tekshirmasdan return qilinvotti
- **Tuzatish:** if da tekshirib NotofundException qo'sish
- **Qanday tekshirdim:** shunchaki kodni ko'rib chiqvotganimda kordim

3. //--------------------------

- **Fayl:** auth.module
- **Simptom:** 
- **Sabab:** jwt secretni xato nom bilan chaqirilgan
- **Tuzatish:** JWT_SECRET_KEY deb yozib qo'ydim
- **Qanday tekshirdim:** kodni ko'rib chiqib bilib qoldim

4. //--------------------------

- **Fayl:** auth.service
- **Simptom:** registerda yangi foydalanuvchi kirsaham Email is already in use deb chiqvotti
- **Sabab:** await yozilmagan
- **Tuzatish:** await yozildi
- **Qanday tekshirdim:** postmanda test qilvotganimda

5. //--------------------------

- **Fayl:** categories.module
- **Simptom:** importsda Productni entitysi kelvotti
- **Sabab:** chunki Product deb yozib qo'yilgan
- **Tuzatish:** Categoryni import qilib o'rniga yozib qo'ydim
- **Qanday tekshirdim:** run qilganimda xato errorlar chiqdi shunda fayl nomidan topib keldim

6. //--------------------------

- **Fayl:** product.module
- **Simptom:** Product service ni oreder service da ishlatiladi lekin product serviceni export qilinmagan
- **Sabab:** 
- **Tuzatish:** exports: [ProductsService]
- **Qanday tekshirdim:** run bo'lishi uchun logdagi xatolardan topidim


7. //--------------------------

- **Fayl:** main.ts
- **Simptom:** Port ni topolmayapti undefined qaytarvotti
- **Sabab:** process.env.PORT deb yozilgan lekin .env da esa APP_PORT
- **Tuzatish:** const port = process.env.APP_PORT
- **Qanday tekshirdim:** npm run start:dev dan keyin logda Server is running on http://localhost:3000/api.

8. //--------------------------

- **Fayl:** app.module
- **Simptom:** ConfigModule.forRoot() global emas
- **Sabab:** 
- **Tuzatish:** ConfigModule.forRoot({ isGlobal: true })
- **Qanday tekshirdim:** 


9. //--------------------------

- **Fayl:** auth.module
- **Simptom:** 
- **Sabab:** .envda 3600 dib yozilgan bu string bo'p qolib millisekunda bop qoladi
- **Tuzatish:** expiresIn: Number(config.get('JWT_EXPIRES_IN')).
- **Qanday tekshirdim:**

10. //--------------------------

- **Fayl:** auth.controller
- **Simptom:** login qilingandan keyin 201 qaytvotti bu xatoku
- **Sabab:** 
- **Tuzatish:** @HttpCode(HttpStatus.OK)
- **Qanday tekshirdim:** check qivotganimda ko'rib qoldim

11. //--------------------------

- **Fayl:** main.ts
- **Simptom:** 
- **Sabab:** NewValidationPipe ichiga kerelik narsalar yozilmagan shunga to'g'ri ishlamidi
- **Tuzatish:** whitelist forbidNonWhitelisted transformlarni qo'shdim
- **Qanday tekshirdim:** kodni ko'rib chiqganimda ko'rdim

12. //--------------------------

- **Fayl:** jwt.strategy
- **Simptom:** GET /users/me da bosh kevovotti 
- **Sabab:** validateda userId qaytvotti lekin boshqa kodda esa id ni kutvotti
- **Tuzatish:** userId ni id ga o'zgartirish
- **Qanday tekshirdim:**

13. //--------------------------

- **Fayl:** jwt.strategy
- **Simptom:** 
- **Sabab:** validate role ni bermiydi shunga rolesguardda role undefined bo'ladi
- **Tuzatish:** role: payload.role qo'shish
- **Qanday tekshirdim:**

14. //--------------------------

- **Fayl:** auth.service
- **Simptom:** 
- **Sabab:**  user null bo'sayam user.password ga chaqiriladi
- **Tuzatish:** if (!user) throw new UnauthorizedException('Invalid email or password');
- **Qanday tekshirdim:**

15. //--------------------------

- **Fayl:** products.service
- **Simptom:** 12 ta element, limit=5 totalPages: 2
- **Sabab:** Math.floor qoldiqqi tashavoradi
- **Tuzatish:** Math.ceil(total / limit)
- **Qanday tekshirdim:** 

16. //--------------------------

- **Fayl:** categories.controller
- **Simptom:** 
- **Sabab:** @UseGuards(RolesGuard, JwtAuthGuard)  RolesGuard JwtAuthGuard request.userni o'rnatishidan oldin ishlidi
- **Tuzatish:** @UseGuards(JwtAuthGuard, RolesGuard)
- **Qanday tekshirdim:** tokensiz 401, user 403, admin 201

17. //--------------------------

- **Fayl:** create-product.dto.ts
- **Simptom:** 
- **Sabab:** pricega @IsInt() qo'yilgan
- **Tuzatish:** @IsNumber
- **Qanday tekshirdim:**

18. //--------------------------

- **Fayl:** orders.controller
- **Simptom:** 
- **Sabab:** @Get(':id') @Get('my') dan oldin e'lon qilingan expressda route'larni tartib bilan tekshiradi shunga my :id ga tushib ParseIntPipedan o'tmaydi
- **Tuzatish:** @Get('my') metodi @Get(':id') dan yuqoriga ko'chirdim
- **Qanday tekshirdim:**

19. //--------------------------

- **Fayl:** orders.service
- **Simptom:** 
- **Sabab:** mahsulot null bo'lishi tekshirilmayapti
- **Tuzatish:** if qo'shish
- **Qanday tekshirdim:**

20. //--------------------------

- **Fayl:** orders.service
- **Simptom:** boshqa user boshqa userni buyurtmasini atmen qilolidi
- **Sabab:** userId parametri qabul qilinib, lekin where ichida ishlatilmayapti
- **Tuzatish:** where: { id, user: { id: userId } }
- **Qanday tekshirdim:**