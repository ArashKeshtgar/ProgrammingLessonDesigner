const e="rebiomed",t="Rebiomed",n={"README.md":144,"app.ts":69,"server.ts":4,"config/keys.ts":34,"services/stripe.ts":17,Dockerfile:46,"render.yaml":33,"test/setup.ts":23,"test/checkout.test.ts":162,"test/fulfillment.test.ts":322,".github/workflows/ci.yml":59,"routes/auth.ts":94,"middleware/auth.ts":26,"types/express.d.ts":15,"client/src/utils/setAuthToken.js":13,"middleware/admin.ts":21,"routes/admin.ts":100,"seed/makeAdmin.ts":33,"services/verification.ts":86,"routes/organizations.ts":266,"routes/inspections.ts":200,"models/Organization.ts":101,"models/Inspection.ts":114,"config/medical.ts":74,"client/src/components/Admin/VerificationQueue.js":176,"routes/products.ts":209,"routes/categories.ts":36,"routes/reviews.ts":40,"client/src/components/Products/SellProduct.js":250,"client/src/components/Products/ProductList.js":204,"client/src/components/Products/ProductDetail.js":289,"services/checkout.ts":221,"routes/payment.ts":45,"routes/orders.ts":93,"routes/webhook.ts":65,"services/fulfillment.ts":301,"services/stripeOps.ts":81,"routes/sales.ts":72,"models/Order.ts":150,"client/src/components/Admin/DisputeQueue.js":97,"routes/payouts.ts":85,"services/offers.ts":216,"routes/offers.ts":102,"models/Offer.ts":58,"client/src/components/Offers/OffersPage.js":179,"services/inspections.ts":260,"client/src/components/Inspections/InspectionReport.js":104,"client/src/App.js":149,"client/src/components/Routing/PrivateRoute.js":10,"client/src/store.js":23,"client/src/components/Layout/Navbar.js":118,"client/src/actions/authActions.js":50,"client/src/reducers/cartReducer.js":74,"client/src/actions/cartActions.js":25,"client/src/components/Checkout/CheckoutForm.js":177,"models/User.ts":21,"models/Product.ts":107,"models/Category.ts":11,"models/Review.ts":19,"db.ts":14},s={"run/required":{file:"config/keys.ts",start:7,end:15,code:`const required = (name: string, devDefault: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(\`\${name} must be set in production\`);
  return devDefault;
};

export const mongoURI: string = required('MONGO_URI', 'mongodb://localhost:27017/mern-store');
export const jwtSecret: string = required('JWT_SECRET', 'dev-only-secret-change-me');`},"run/placeholder":{file:"services/stripe.ts",start:5,end:15,code:`export const paymentsConfigured = !!keys.stripeSecretKey;

// The SDK throws on construction without a key, which would take the whole
// server down (e.g. a demo deployment before Stripe is set up). Use a
// placeholder instead, and let payment endpoints say payments are off.
const stripe = new Stripe(keys.stripeSecretKey || 'sk_test_not_configured');

export function requirePayments(_req: Request, res: Response, next: NextFunction): void {
  if (paymentsConfigured) return next();
  res.status(503).json({ msg: 'Payments are not configured on this server yet' });
}`},"run/serve":{file:"app.ts",start:56,end:67,code:`app.use('/api', (_req, res) => {
  res.status(404).json({ msg: 'Not found' });
});

// In production one service hosts both the API and the React build, so the
// client can call /api on its own origin. Unknown paths get index.html and are
// routed on the client.
if (keys.serveClient) {
  const build = path.join(process.cwd(), 'client', 'build');
  app.use(express.static(build, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(build, 'index.html')));
}`},"run/image":{file:"Dockerfile",start:36,end:46,code:`ENV NODE_ENV=production PORT=5000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=server-build /app/dist ./dist
COPY --from=client-build /app/client/build ./client/build
RUN mkdir -p uploads private-uploads && chown -R node:node uploads private-uploads
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \\
  CMD wget -qO- http://localhost:\${PORT}/api/health || exit 1
CMD ["node", "dist/server.js"]`},"tests/hooks":{file:"test/setup.ts",start:17,end:23,code:`export const mochaHooks = {
  async beforeAll(this: Mocha.Context) {
    this.timeout(30000);
    await mongoose.connection.asPromise();
    await Promise.all(Object.values(mongoose.models).map(m => m.init()));
  }
};`},"tests/race":{file:"test/checkout.test.ts",start:110,end:117,code:`it('decrements stock once when called concurrently (webhook + client race)', async () => {
  const { product, order, pi } = await setup(5, 2);
  await Promise.all([
    finalizeOrder(order.id, pi, noRefund),
    finalizeOrder(order.id, pi, noRefund)
  ]);
  expect((await Product.findById(product.id))!.stock).to.equal(3);
});`},"tests/ci":{file:".github/workflows/ci.yml",start:12,end:23,code:`services:
  mongo:
    image: mongo:7
    ports:
      - 27017:27017
    options: >-
      --health-cmd "mongosh --quiet --eval 'db.runCommand({ ping: 1 })'"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
env:
  MONGO_URI: mongodb://localhost:27017/rebiomed-ci`},"tests/stub":{file:"test/fulfillment.test.ts",start:57,end:69,code:`  stripeOps.refund = async (pi, amount, key) => {
    if (failRefund) throw new Error('card network down');
    calls.refund.push([pi, amount, key]);
    return { id: \`re_\${calls.refund.length}\` };
  };
  stripeOps.transfer = async (p, key) => {
    if (failTransfer) throw new Error('insufficient platform balance');
    calls.transfer.push([p, key]);
    return { id: \`tr_\${calls.transfer.length}\` };
  };
});

afterEach(() => { Object.assign(stripeOps, original); });`},"tests/env":{file:"test/setup.ts",start:5,end:12,code:`process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-store-test';
process.env.PRIVATE_UPLOAD_DIR = path.join(os.tmpdir(), 'rebiomed-test-private-uploads');
// Tests never reach Stripe (stripeOps is stubbed), but payment routes need a
// key to be considered configured. Fixed here so CI, with no .env, matches local.
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_tests';
// Lets tests sign Connect webhook events with Stripe's own test-header helper.
process.env.STRIPE_CONNECT_WEBHOOK_SECRET = 'whsec_test_connect_secret';
process.env.PLATFORM_FEE_BPS = '800';`},"auth/sign":{file:"routes/auth.ts",start:11,end:14,code:`const signToken = (user: IUser): string => {
  const payload = { user: { id: user.id, name: user.name, isAdmin: user.isAdmin } };
  return jwt.sign(payload, keys.jwtSecret, { expiresIn: '7d' });
};`},"auth/hash":{file:"routes/auth.ts",start:39,end:42,code:`const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash(password, salt);

user = await User.create({ name, email, password: hashed });`},"auth/guard":{file:"middleware/auth.ts",start:10,end:26,code:`export default function auth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    res.status(401).json({ msg: 'No token, authorization denied' });
    return;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, keys.jwtSecret) as DecodedToken;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}`},"auth/register":{file:"routes/auth.ts",start:21,end:23,code:`check('name', 'Name is required').not().isEmpty(),
check('email', 'Please include a valid email').isEmail(),
check('password', 'Password must be at least 6 characters').isLength({ min: 6 })`},"auth/login":{file:"routes/auth.ts",start:69,end:71,code:`const user = await User.findOne({ email });
if (!user || !(await bcrypt.compare(password, user.password))) {
  return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });`},"admin/db":{file:"middleware/admin.ts",start:4,end:13,code:`// Use after \`auth\`. Checks the database rather than the isAdmin claim in the
// JWT, so revoking admin rights takes effect before the token expires.
export default async function admin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user!.id).select('isAdmin');
    if (!user?.isAdmin) {
      res.status(403).json({ msg: 'Admin access required' });
      return;
    }
    next();`},"admin/mount":{file:"routes/admin.ts",start:12,end:12,code:"router.use(auth, admin);"},"admin/grant":{file:"seed/makeAdmin.ts",start:20,end:24,code:`const user = await User.findOneAndUpdate({ email }, { isAdmin: !revoke }, { new: true });
if (!user) {
  console.error(\`No user with email \${email}. Register the account first.\`);
  process.exit(1);
}`},"admin/errors":{file:"routes/admin.ts",start:14,end:20,code:`const sendError = (res: Response, err: unknown) => {
  if (err instanceof VerificationError || err instanceof FulfillmentError) {
    return res.status(err.status).json({ msg: err.message });
  }
  console.error((err as Error).message);
  return res.status(500).send('Server error');
};`},"admin/queue":{file:"routes/admin.ts",start:27,end:34,code:`const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
if (!(VERIFICATION_STATUSES as readonly string[]).includes(status)) {
  return res.status(400).json({ msg: \`status must be one of: \${VERIFICATION_STATUSES.join(', ')}\` });
}
const orgs = await Organization.find({ verificationStatus: status })
  .populate('owner', 'name email')
  .populate('verificationHistory.by', 'name')
  .sort('createdAt');`},"files/dir":{file:"config/keys.ts",start:25,end:26,code:`// Verification documents live outside the public /uploads static folder.
export const privateUploadDir: string = process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private-uploads');`},"files/sniff":{file:"services/verification.ts",start:79,end:86,code:`// Identifies an uploaded file by its leading bytes instead of trusting the
// client-supplied Content-Type or file extension.
export function detectDocumentType(head: Buffer): string | null {
  if (head.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  return null;
}`},"files/download":{file:"routes/organizations.ts",start:237,end:244,code:`const allowed = org && (org.owner.toString() === req.user!.id || await isAdminUser(req.user!.id));
// 404 rather than 403 so outsiders cannot probe which organizations exist.
const doc = allowed ? org.documents.id(req.params.docId) : null;
if (!doc) return res.status(404).json({ msg: 'Document not found' });

res.setHeader('X-Content-Type-Options', 'nosniff');
res.type(doc.mimeType);
res.download(path.join(keys.privateUploadDir, doc.storedName), doc.originalName, err => {`},"files/hide":{file:"models/Organization.ts",start:66,end:72,code:`// storedName is an internal path detail; never send it to clients.
VerificationDocumentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { storedName: _hidden, ...visible } = ret;
    return visible;
  }
});`},"files/read8":{file:"routes/organizations.ts",start:170,end:177,code:`const handle = await fs.open(file.path, 'r');
const head = Buffer.alloc(8);
await handle.read(head, 0, 8, 0);
await handle.close();
const mimeType = detectDocumentType(head);
if (!mimeType) {
  await discard();
  return res.status(400).json({ msg: 'Only PDF, PNG and JPEG files are accepted' });`},"files/limits":{file:"routes/organizations.ts",start:63,end:66,code:`const documentUpload = multer({
  dest: keys.privateUploadDir,
  limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1 }
}).single('document');`},"organizations/editable":{file:"routes/organizations.ts",start:29,end:31,code:`// Fields an owner may set. Verification fields are deliberately absent: they
// only change through the verification flow.
const EDITABLE_FIELDS = ['name', 'type', 'province', 'city', 'phone', 'website', 'mdelNumber'] as const;`},"organizations/identity":{file:"services/verification.ts",start:6,end:8,code:`// Changing any of these after verification means an admin checked different
// details than the ones now shown to buyers, so verification is reset.
export const IDENTITY_FIELDS = ['name', 'type', 'province', 'city', 'mdelNumber'] as const;`},"organizations/reset":{file:"routes/organizations.ts",start:129,end:138,code:`const norm = (v: unknown) => String(v ?? '').trim();
const before = Object.fromEntries(IDENTITY_FIELDS.map(f => [f, norm(org.get(f))]));
org.set(pickEditable(req.body));
await org.save();

const identityChanged = IDENTITY_FIELDS.some(f => norm(org.get(f)) !== before[f]);
if (identityChanged && (org.verificationStatus === 'verified' || org.verificationStatus === 'pending')) {
  await changeVerificationStatus(org, 'unverified', req.user!.id,
    'Organization details changed after review; request verification again');
}`},"organizations/validators":{file:"routes/organizations.ts",start:41,end:47,code:`const orgValidators = [
  check('name', 'Organization name is required').trim().notEmpty(),
  check('type', \`Type must be one of: \${ORGANIZATION_TYPES.join(', ')}\`).isIn(ORGANIZATION_TYPES),
  check('province', 'Province must be a Canadian province/territory code').isIn(PROVINCES),
  check('city', 'City is required').trim().notEmpty(),
  check('website', 'Website must be a valid URL').optional({ values: 'falsy' }).isURL()
];`},"organizations/public":{file:"routes/organizations.ts",start:49,end:50,code:`// Public fields shown next to listings.
const PUBLIC_FIELDS = 'name type province city website verificationStatus verifiedAt createdAt';`},"verification/request":{file:"services/verification.ts",start:42,end:52,code:`export async function requestVerification(org: IOrganization, by: string): Promise<IOrganization> {
  if (org.verificationStatus === 'pending') throw new VerificationError('Verification is already under review', 409);
  if (org.verificationStatus === 'verified') throw new VerificationError('Organization is already verified', 409);
  if (!org.documents.length) {
    throw new VerificationError('Upload at least one supporting document before requesting verification');
  }
  if (org.type === 'dealer' && !org.mdelNumber) {
    throw new VerificationError('Dealers must provide their Health Canada MDEL number');
  }
  return changeVerificationStatus(org, 'pending', by);
}`},"verification/change":{file:"services/verification.ts",start:19,end:40,code:`export async function changeVerificationStatus(
  org: IOrganization,
  status: VerificationStatus,
  by: string | Types.ObjectId,
  note?: string
): Promise<IOrganization> {
  const wasVerified = org.verificationStatus === 'verified';

  org.verificationStatus = status;
  org.verificationNote = note;
  org.verifiedAt = status === 'verified' ? new Date() : undefined;
  org.verificationHistory.push({ status, at: new Date(), by: new Types.ObjectId(String(by)), note });
  await org.save();

  const gated = { organization: org._id, deviceClass: { $in: VERIFICATION_GATED_CLASSES } };
  if (wasVerified && status !== 'verified') {
    await Product.updateMany(gated, { suspended: true });
  } else if (!wasVerified && status === 'verified') {
    await Product.updateMany(gated, { suspended: false });
  }
  return org;
}`},"verification/reject":{file:"services/verification.ts",start:63,end:65,code:`export async function reject(orgId: string, adminId: string, note: unknown): Promise<IOrganization> {
  const reason = typeof note === 'string' ? note.trim() : '';
  if (!reason) throw new VerificationError('A reason is required so the seller knows what to fix');`},"verification/approve":{file:"services/verification.ts",start:54,end:60,code:`export async function approve(orgId: string, adminId: string): Promise<IOrganization> {
  const org = await findOrg(orgId);
  if (org.verificationStatus !== 'pending') {
    throw new VerificationError('Only organizations awaiting review can be verified', 409);
  }
  return changeVerificationStatus(org, 'verified', adminId);
}`},"listings/classes":{file:"config/medical.ts",start:18,end:30,code:`// Which device classes an organization may list, by verification status.
// Class III needs a seller an admin has verified; Class IV (highest risk,
// e.g. implantables and life support) is not accepted at all yet.
export const OPEN_DEVICE_CLASSES: readonly DeviceClass[] = ['I', 'II'];
export const VERIFIED_DEVICE_CLASSES: readonly DeviceClass[] = ['I', 'II', 'III'];

export const listableDeviceClasses = (status: VerificationStatus): readonly DeviceClass[] =>
  status === 'verified' ? VERIFIED_DEVICE_CLASSES : OPEN_DEVICE_CLASSES;

// Classes that are only listed because the seller is verified; these listings
// are suspended if the organization loses its verification.
export const VERIFICATION_GATED_CLASSES: readonly DeviceClass[] =
  VERIFIED_DEVICE_CLASSES.filter(c => !OPEN_DEVICE_CLASSES.includes(c));`},"listings/gate":{file:"routes/products.ts",start:140,end:145,code:`if (!listableDeviceClasses(org.verificationStatus).includes(req.body.deviceClass)) {
  const msg = req.body.deviceClass === 'IV'
    ? 'Class IV devices cannot be listed on the marketplace yet'
    : 'Class III devices can only be listed by verified sellers; request verification from your organization page';
  return res.status(403).json({ errors: [{ msg }] });
}`},"listings/history":{file:"routes/products.ts",start:26,end:41,code:`const parseServiceHistory = (raw: unknown): IServiceRecord[] => {
  if (raw === undefined || raw === '') return [];
  const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(list)) throw new Error('Service history must be a list');
  if (list.length > MAX_SERVICE_RECORDS) throw new Error(\`At most \${MAX_SERVICE_RECORDS} service records\`);
  return list.map((r, i) => {
    const date = new Date(r?.date);
    if (Number.isNaN(date.getTime())) throw new Error(\`Service record \${i + 1}: invalid date\`);
    if (date.getTime() > Date.now()) throw new Error(\`Service record \${i + 1}: date is in the future\`);
    if (!SERVICE_TYPES.includes(r?.type)) throw new Error(\`Service record \${i + 1}: invalid type\`);
    const performedBy = String(r?.performedBy ?? '').trim();
    if (!performedBy) throw new Error(\`Service record \${i + 1}: "performed by" is required\`);
    const notes = r?.notes ? String(r.notes).trim() : undefined;
    return { date, type: r.type, performedBy, notes };
  });
};`},"listings/validators":{file:"routes/products.ts",start:45,end:61,code:`const listingValidators = [
  check('title', 'Title is required').trim().notEmpty(),
  check('description', 'Description is required').trim().notEmpty(),
  check('price', 'Price must be greater than 0').isFloat({ gt: 0 }),
  check('stock', 'Quantity must be a whole number').optional({ values: 'falsy' }).isInt({ min: 0 }),
  check('category', 'Category is required').isMongoId(),
  check('manufacturer', 'Manufacturer is required').trim().notEmpty(),
  check('deviceModel', 'Model is required').trim().notEmpty(),
  check('yearOfManufacture', \`Year must be between 1950 and \${currentYear}\`)
    .optional({ values: 'falsy' }).isInt({ min: 1950, max: currentYear }),
  check('deviceClass', 'Device class must be I, II, III or IV').isIn(DEVICE_CLASSES),
  check('condition', 'Condition is required').isIn(CONDITIONS),
  check('usageHours', 'Usage hours must be a whole number').optional({ values: 'falsy' }).isInt({ min: 0 }),
  check('lastServiceDate', 'Last service date is invalid').optional({ values: 'falsy' }).isISO8601(),
  check('lastCalibrationDate', 'Last calibration date is invalid').optional({ values: 'falsy' }).isISO8601(),
  check('province', 'Province must be a Canadian province/territory code').optional({ values: 'falsy' }).isIn(PROVINCES)
];`},"listings/removed":{file:"routes/products.ts",start:200,end:201,code:`await product.deleteOne();
await cancelOpenForProduct(product.id);`},"browse/filter":{file:"routes/products.ts",start:69,end:81,code:`const filter: Record<string, unknown> = { suspended: { $ne: true } };
const { category, deviceClass, condition, province, inspected } = req.query;
if (inspected === '1' || inspected === 'true') filter['inspection.validUntil'] = { $gt: new Date() };
if (typeof category === 'string' && category) filter.category = category;
if (typeof deviceClass === 'string' && (DEVICE_CLASSES as readonly string[]).includes(deviceClass)) {
  filter.deviceClass = deviceClass;
}
if (typeof condition === 'string' && (CONDITIONS as readonly string[]).includes(condition)) {
  filter.condition = condition;
}
if (typeof province === 'string' && (PROVINCES as readonly string[]).includes(province)) {
  filter['location.province'] = province;
}`},"browse/detail":{file:"routes/products.ts",start:113,end:116,code:`const product = await Product.findById(req.params.id)
  .populate('category', 'name')
  .populate('organization', ORG_PUBLIC_FIELDS);
if (!product || product.suspended) return res.status(404).json({ msg: 'Product not found' });`},"browse/orgFields":{file:"routes/products.ts",start:21,end:21,code:"const ORG_PUBLIC_FIELDS = 'name type province city verificationStatus';"},"browse/mine":{file:"routes/products.ts",start:99,end:101,code:`const products = await Product.find({ seller: req.user!.id })
  .populate('category', 'name')
  .sort('-createdAt');`},"checkout/server":{file:"services/checkout.ts",start:45,end:48,code:`// Prices a cart from the database. The client only says *what* it wants and how
// many; every price comes from the Product collection (or, for a line with an
// offerId, from that buyer's accepted offer), never from the request.
export async function priceCart(lines: unknown, buyerId?: string): Promise<PricedCart> {`},"checkout/split":{file:"services/checkout.ts",start:102,end:109,code:`const bySeller = new Map<string, PricedFulfillment>();
for (const item of items) {
  const key = item.organization.toString();
  const f = bySeller.get(key) ?? { organization: item.organization, subtotalCents: 0, platformFeeCents: 0 };
  f.subtotalCents += toCents(item.price) * item.quantity;
  bySeller.set(key, f);
}
const fulfillments = [...bySeller.values()].map(f => ({ ...f, platformFeeCents: platformFeeFor(f.subtotalCents) }));`},"checkout/fee":{file:"services/checkout.ts",start:42,end:43,code:`export const platformFeeFor = (subtotalCents: number): number =>
  Math.round((subtotalCents * keys.platformFeeBps) / 10000);`},"checkout/intent":{file:"routes/payment.ts",start:14,end:24,code:`const cart = await priceCart(req.body.items, req.user!.id);
const order = await createPendingOrder(req.user!.id, cart);

const paymentIntent = await stripe.paymentIntents.create({
  amount: cart.totalCents,
  currency: CURRENCY,
  automatic_payment_methods: { enabled: true },
  metadata: { orderId: order.id },
  // Groups the seller transfers made later for this order.
  transfer_group: \`order_\${order.id}\`
});`},"checkout/lines":{file:"services/checkout.ts",start:55,end:67,code:`for (const line of lines as CartLine[]) {
  const id = String(line?.productId ?? '');
  const qty = Number(line?.quantity);
  if (!Types.ObjectId.isValid(id)) throw new CheckoutError('Invalid product id');
  if (!Number.isInteger(qty) || qty < 1) throw new CheckoutError('Invalid quantity');
  if (line?.offerId !== undefined || offerIds.has(id)) {
    // An offer covers exactly one unit, bought on its own line.
    if (qty !== 1 || quantities.has(id)) {
      throw new CheckoutError('An offer covers one unit; remove other quantities of that item from the cart');
    }
    offerIds.set(id, String(line.offerId));
  }
  quantities.set(id, (quantities.get(id) ?? 0) + qty);`},"paid/lock":{file:"services/checkout.ts",start:163,end:177,code:`if (order.status !== 'pending') return order;

if (paymentIntent.status !== 'succeeded') {
  throw new CheckoutError('Payment has not succeeded', 402);
}
if (paymentIntent.amount !== order.totalCents || paymentIntent.currency !== order.currency) {
  throw new CheckoutError('Payment amount does not match order total');
}

const locked = await Order.findOneAndUpdate(
  { _id: order._id, status: 'pending' },
  { status: 'processing' },
  { new: true }
);
if (!locked) return (await Order.findById(orderId))!;`},"paid/stock":{file:"services/checkout.ts",start:193,end:207,code:`const decremented: IOrderItem[] = [];
for (const item of locked.items) {
  const res = await Product.updateOne(
    { _id: item.product, stock: { $gte: item.quantity } },
    { $inc: { stock: -item.quantity } }
  );
  if (res.modifiedCount !== 1) {
    await Promise.all(decremented.map(d =>
      Product.updateOne({ _id: d.product }, { $inc: { stock: d.quantity } })
    ));
    await releaseOffers(offerIds, locked._id as Types.ObjectId);
    return refundOrder();
  }
  decremented.push(item);
}`},"paid/mount":{file:"app.ts",start:30,end:32,code:`// Stripe signs the raw request body, so the webhook must be mounted before express.json().
app.use('/api/payment/webhook', webhookRoutes);
app.use(express.json());`},"paid/verify":{file:"routes/webhook.ts",start:18,end:29,code:`const verify = (body: Buffer, signature: string): Stripe.Event => {
  const secrets = [keys.stripeWebhookSecret, keys.stripeConnectWebhookSecret].filter(Boolean);
  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
};`},"escrow/buyer":{file:"routes/orders.ts",start:10,end:16,code:`// The buyer's view of an order: each seller's part with its shipping status,
// but not the seller's payout or the platform fee.
const forBuyer = (order: IOrder) => {
  const o = order.toJSON() as unknown as Record<string, unknown> & { fulfillments: Array<Record<string, unknown>> };
  o.fulfillments = o.fulfillments.map(({ payout: _p, platformFeeCents: _f, ...visible }) => visible);
  return o;
};`},"escrow/transition":{file:"services/fulfillment.ts",start:54,end:63,code:`const updated = await Order.findOneAndUpdate(
  {
    _id: orderId,
    status: 'paid',
    ...conditions.order,
    fulfillments: { $elemMatch: { _id: fulfillmentId, ...conditions.fulfillment } }
  },
  { $set: positional(set) },
  { new: true }
);`},"escrow/confirm":{file:"services/fulfillment.ts",start:118,end:126,code:`export async function confirmDelivery(
  orderId: string, fulfillmentId: string, buyerId: string, ops: Ops = stripeOps
): Promise<IOrder> {
  await transition(orderId, fulfillmentId,
    { order: { user: buyerId }, fulfillment: { status: 'shipped' } },
    { status: 'delivered', deliveredAt: new Date(), 'payout.status': 'pending' },
    'confirm delivery of');
  return tryPayout(orderId, fulfillmentId, ops);
}`},"escrow/payout":{file:"services/fulfillment.ts",start:234,end:250,code:`const org = await Organization.findById(f.organization);
if (!org?.stripeAccountId || !org.payoutsEnabled) {
  return setPayout({ status: 'pending', error: 'Seller has not finished setting up payouts' });
}

try {
  const transfer = await ops.transfer({
    amountCents: f.payout.amountCents,
    destination: org.stripeAccountId,
    transferGroup: \`order_\${orderId}\`,
    sourceTransaction: locked.stripeChargeId,
    metadata: { orderId: String(orderId), fulfillmentId: String(fulfillmentId) }
  }, \`payout_\${fulfillmentId}\`);
  return setPayout({ status: 'paid', transferId: transfer.id, paidAt: new Date() }, ['error']);
} catch (err) {
  return setPayout({ status: 'failed', error: (err as Error).message });
}`},"disputes/cancel":{file:"services/fulfillment.ts",start:104,end:114,code:`// Seller can't or won't ship: refund the buyer for this seller's part only.
export async function cancelBySeller(
  orderId: string, fulfillmentId: string, organizationId: string, reason: unknown, ops: Ops = stripeOps
): Promise<IOrder> {
  const why = requiredText(reason, 'A cancellation reason');
  const order = await transition(orderId, fulfillmentId,
    { fulfillment: { organization: organizationId, status: 'awaiting_shipment' } },
    { status: 'cancelled', cancelReason: why },
    'cancel');
  return refundFulfillment(order, fulfillmentId, 'awaiting_shipment', true, ops);
}`},"disputes/open":{file:"services/fulfillment.ts",start:128,end:136,code:`export async function openDispute(
  orderId: string, fulfillmentId: string, buyerId: string, reason: unknown
): Promise<IOrder> {
  const why = requiredText(reason, 'A description of the problem');
  return transition(orderId, fulfillmentId,
    { order: { user: buyerId }, fulfillment: { status: { $in: ['awaiting_shipment', 'shipped'] } } },
    { status: 'disputed', dispute: { reason: why, openedAt: new Date() } },
    'report a problem with');
}`},"disputes/unshipped":{file:"services/fulfillment.ts",start:163,end:173,code:`// Ruling for the seller on something never shipped (e.g. "seller isn't
// answering") means the order carries on, not that the seller gets paid for
// equipment the buyer never received.
const order = Types.ObjectId.isValid(orderId) ? await Order.findById(orderId) : null;
const shipped = !!order?.fulfillments.id(fulfillmentId)?.shippedAt;
if (!shipped) {
  return transition(orderId, fulfillmentId,
    { fulfillment: { status: 'disputed', shippedAt: { $exists: false } } },
    { status: 'awaiting_shipment', ...resolved },
    'resume');
}`},"disputes/refund":{file:"services/fulfillment.ts",start:187,end:201,code:`const f = fulfillmentIn(order, fulfillmentId);
try {
  const refund = await ops.refund(order.stripePaymentIntentId!, f.subtotalCents, \`refund_\${fulfillmentId}\`);
  if (putBackStock) await restock(order, f.organization);
  return (await Order.findOneAndUpdate(
    { _id: order._id, 'fulfillments._id': fulfillmentId },
    { $set: { 'fulfillments.$.refundId': refund.id } },
    { new: true }
  ))!;
} catch (err) {
  await Order.updateOne(
    { _id: order._id, 'fulfillments._id': fulfillmentId },
    { $set: { 'fulfillments.$.status': previousStatus } }
  );
  throw new FulfillmentError(\`Refund failed: \${(err as Error).message}\`, 502);`},"connect/express":{file:"services/stripeOps.ts",start:52,end:62,code:`async createExpressAccount(email: string, organizationId: string) {
  const a = await stripe.accounts.create({
    type: 'express',
    country: 'CA',
    email,
    business_type: 'company',
    capabilities: { transfers: { requested: true } },
    metadata: { organizationId }
  });
  return toAccountState(a);
},`},"connect/state":{file:"services/stripeOps.ts",start:15,end:26,code:`export const toAccountState = (a: {
  id: string;
  details_submitted?: boolean;
  payouts_enabled?: boolean;
  capabilities?: { transfers?: string } | null;
}): AccountState => ({
  id: a.id,
  detailsSubmitted: !!a.details_submitted,
  // Transfers to the account need the transfers capability to be active, not
  // just payouts from the account to its bank.
  payoutsEnabled: !!a.payouts_enabled && a.capabilities?.transfers === 'active'
});`},"connect/sync":{file:"services/fulfillment.ts",start:294,end:301,code:`// Stores the latest account state and, once payouts are possible, sends any
// payouts that were waiting for the seller to finish onboarding.
export async function syncAccount(org: IOrganization, state: AccountState, ops: Ops = stripeOps): Promise<IOrganization> {
  applyAccountState(org, state);
  await org.save();
  if (org.payoutsEnabled) await releasePendingPayouts(org._id as Types.ObjectId, ops);
  return org;
}`},"connect/event":{file:"routes/webhook.ts",start:53,end:56,code:`} else if (event.type === 'account.updated') {
  // A seller progressed through (or lost) Stripe onboarding.
  const org = await Organization.findOne({ stripeAccountId: event.data.object.id });
  if (org) await syncAccount(org, toAccountState(event.data.object));`},"connect/refresh":{file:"routes/payouts.ts",start:59,end:65,code:`router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { org } = await loadMine(req.user!.id);
    if (!org) return res.status(404).json({ msg: 'Create your organization first' });
    if (!org.stripeAccountId) return res.json(payoutState(org));
    const synced = await syncAccount(org, await stripeOps.retrieveAccount(org.stripeAccountId));
    res.json(payoutState(synced));`},"connect/release":{file:"services/fulfillment.ts",start:253,end:258,code:`export async function releasePendingPayouts(organizationId: Types.ObjectId | string, ops: Ops = stripeOps): Promise<number> {
  const orders = await Order.find({
    fulfillments: {
      $elemMatch: { organization: organizationId, status: 'delivered', 'payout.status': { $in: ['pending', 'failed'] } }
    }
  });`},"offers/deadlines":{file:"config/medical.ts",start:51,end:52,code:`export const OFFER_RESPONSE_DAYS = 7;
export const ACCEPTED_OFFER_HOURS = 72;`},"offers/open":{file:"services/offers.ts",start:69,end:91,code:`const amountCents = parseAmount(amount);
const priceCents = Math.round(product.price * 100);
if (amountCents >= priceCents) {
  throw new OfferError(\`An offer must be below the listed price of \${formatCad(priceCents)}; at that price, just buy it\`);
}

await expireStale();
try {
  return await Offer.create({
    product: product._id,
    organization: product.organization,
    buyer: buyerId,
    amountCents,
    message: note(message),
    expiresAt: responseDeadline(),
    openKey: \`\${buyerId}:\${product.id}\`
  });
} catch (err) {
  if ((err as { code?: number }).code === 11000) {
    throw new OfferError('You already have an open offer on this listing', 409);
  }
  throw err;
}`},"offers/lazy":{file:"services/offers.ts",start:41,end:53,code:`// Offers past their deadline are closed lazily, whenever offers are read or
// changed, rather than by a background job.
export async function expireStale(): Promise<void> {
  const now = new Date();
  await Offer.updateMany(
    { status: { $in: ['pending', 'countered'] }, expiresAt: { $lte: now } },
    { $set: { status: 'expired' }, $unset: { openKey: '' } }
  );
  await Offer.updateMany(
    { status: 'accepted', acceptedUntil: { $lte: now } },
    { $set: { status: 'expired' }, $unset: { openKey: '' } }
  );
}`},"offers/claim":{file:"services/offers.ts",start:180,end:200,code:`export async function claimOffers(offerIds: Types.ObjectId[], orderId: Types.ObjectId, orderCreatedAt: Date): Promise<boolean> {
  const claimed: Types.ObjectId[] = [];
  for (const id of offerIds) {
    const res = await Offer.updateOne(
      {
        _id: id,
        status: { $in: ['accepted', 'expired'] },
        agreedAmountCents: { $exists: true },
        acceptedUntil: { $gte: orderCreatedAt },
        usedByOrder: { $exists: false }
      },
      { $set: { status: 'used', usedByOrder: orderId }, $unset: { openKey: '' } }
    );
    if (res.modifiedCount !== 1) {
      await releaseOffers(claimed, orderId);
      return false;
    }
    claimed.push(id);
  }
  return true;
}`},"inspections/eligible":{file:"services/inspections.ts",start:28,end:30,code:`// Only verified biomedical service providers may inspect.
export const isEligibleInspector = (org: Pick<IOrganization, 'type' | 'verificationStatus'>): boolean =>
  org.type === 'service_provider' && org.verificationStatus === 'verified';`},"inspections/checks":{file:"config/medical.ts",start:57,end:64,code:`export const INSPECTION_CHECKS = [
  'visual_physical',          // housing, cables, connectors, labels, cleanliness
  'electrical_safety',        // leakage current / earth resistance (IEC 62353, CSA C22.2 No. 60601-1)
  'functional_performance',   // operates to the manufacturer's specifications
  'calibration_accuracy',     // readings against a reference
  'alarms',                   // audible/visual alarms and self-tests
  'accessories_documentation' // probes, cuffs, manuals, service records present
] as const;`},"inspections/outcome":{file:"services/inspections.ts",start:190,end:196,code:`const failed = checks.filter(c => c.result === 'fail');
if (outcome === 'pass' && failed.length) {
  throw new InspectionError('A device with failed checks cannot pass outright; use "pass with findings" or "fail"');
}
if (failed.some(c => c.item === 'electrical_safety') && outcome !== 'fail') {
  throw new InspectionError('A device that fails electrical safety testing must fail the inspection');
}`},"inspections/date":{file:"services/inspections.ts",start:152,end:160,code:`// A date-only value is UTC midnight of the inspector's local date, and in
// Canada the local date can be a calendar day behind UTC (an evening request
// in Vancouver is stamped the next day in UTC). So compare calendar days, with
// one day of slack, rather than instants.
if (inspectedAt.getTime() > Date.now() + DAY) throw new InspectionError('Inspection date is in the future');
const requestedDay = Date.UTC(requestedAt.getUTCFullYear(), requestedAt.getUTCMonth(), requestedAt.getUTCDate());
if (inspectedAt.getTime() < requestedDay - DAY) {
  throw new InspectionError('Inspection date is before the inspection was requested');
}`},"inspections/publish":{file:"services/inspections.ts",start:229,end:247,code:`// Publish on the listing unless a more recent inspection is already shown.
const inspector = await Organization.findById(inspectorOrgId).select('name');
await Product.updateOne(
  {
    _id: done.product,
    $or: [{ inspection: { $exists: false } }, { 'inspection.inspectedAt': { $lte: report.inspectedAt } }]
  },
  {
    $set: {
      inspection: {
        report: done._id,
        outcome: report.outcome,
        inspectedAt: report.inspectedAt,
        validUntil: new Date(report.inspectedAt.getTime() + INSPECTION_VALID_DAYS * DAY),
        inspectorName: inspector?.name ?? 'Inspector'
      }
    }
  }
);`},"pages/rehydrate":{file:"client/src/App.js",start:30,end:44,code:`// Rehydrate auth state from a stored JWT on page load
const token = localStorage.getItem('jwtToken');
if (token) {
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      store.dispatch(logoutUser());
    } else {
      setAuthToken(token);
      store.dispatch(setCurrentUser(decoded.user));
    }
  } catch {
    store.dispatch(logoutUser());
  }
}`},"pages/header":{file:"client/src/utils/setAuthToken.js",start:3,end:11,code:`const setAuthToken = token => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};`},"pages/private":{file:"client/src/components/Routing/PrivateRoute.js",start:5,end:8,code:`const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};`},"pages/logout":{file:"client/src/actions/authActions.js",start:46,end:50,code:`export const logoutUser = () => dispatch => {
  localStorage.removeItem('jwtToken');
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};`},"cart/persist":{file:"client/src/store.js",start:15,end:21,code:`store.subscribe(() => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(store.getState().cart.items));
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
});`},"cart/offerline":{file:"client/src/actions/cartActions.js",start:8,end:13,code:`// Puts one unit in the cart at an accepted offer's price (replacing any other
// line for the same listing). The server re-checks the offer at checkout.
export const addOfferToCart = (offer) => ({
  type: ADD_OFFER_TO_CART,
  payload: offer
});`},"cart/confirm":{file:"client/src/components/Checkout/CheckoutForm.js",start:52,end:70,code:`const { error: confirmError } = await stripe.confirmPayment({
  elements,
  redirect: 'if_required'
});

if (confirmError) {
  setError(confirmError.message);
  setProcessing(false);
  return;
}

try {
  const order = await dispatch(confirmOrder(orderId));
  if (order.status === 'refunded') {
    setError('Sorry, an item sold out while you were paying. Your payment has been refunded.');
    return;
  }
  dispatch(clearCart());
  onSuccess();`},"cart/nokey":{file:"client/src/components/Checkout/CheckoutForm.js",start:16,end:18,code:`const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;`},"cart/badge":{file:"client/src/components/Layout/Navbar.js",start:78,end:91,code:`<AnimatePresence>
  {cartCount > 0 && (
    <motion.span
      key={cartCount}
      className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {cartCount}
    </motion.span>
  )}
</AnimatePresence>`},"cart/fixed":{file:"client/src/reducers/cartReducer.js",start:21,end:22,code:`// An offer line is fixed at one unit; don't mix list-price units into it.
if (existing && existing.offerId) return state;`},"cart/done":{file:"client/src/components/Checkout/CheckoutForm.js",start:64,end:70,code:`const order = await dispatch(confirmOrder(orderId));
if (order.status === 'refunded') {
  setError('Sorry, an item sold out while you were paying. Your payment has been refunded.');
  return;
}
dispatch(clearCart());
onSuccess();`},"sellers-data/copy":{file:"models/Product.ts",start:48,end:56,code:`// Latest completed independent inspection, copied here so browsing can
// filter and badge on it. The full report lives in the Inspection.
inspection?: {
  report: Types.ObjectId;
  outcome: InspectionOutcome;
  inspectedAt: Date;
  validUntil: Date;
  inspectorName: string;
};`},"sellers-data/refs":{file:"models/Product.ts",start:72,end:76,code:`category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
imageUrl: { type: String, required: true },
stock: { type: Number, default: 1, min: 0 },
seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },`},"sellers-data/hideName":{file:"models/Organization.ts",start:66,end:72,code:`// storedName is an internal path detail; never send it to clients.
VerificationDocumentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { storedName: _hidden, ...visible } = ret;
    return visible;
  }
});`},"orders-data/lifecycle":{file:"models/Order.ts",start:20,end:27,code:`// Each seller's part of an order moves through its own lifecycle. The buyer's
// money stays with the platform until the buyer confirms delivery (or an admin
// resolves a dispute in the seller's favour); only then is it paid out.
//
// awaiting_payment -> awaiting_shipment -> shipped -> delivered
//                          |                  |
//                          v                  v
//                      cancelled          disputed -> refunded | delivered`},"orders-data/openkey":{file:"models/Offer.ts",start:27,end:30,code:`// "<buyer>:<product>" while the offer is open, removed when it closes. A
// unique sparse index on it means a buyer can have only one open offer per
// listing, even if two requests race.
openKey?: string;`},"orders-data/payout":{file:"models/Order.ts",start:32,end:37,code:`// not_due    -> buyer has not confirmed delivery yet
// pending    -> due, waiting to be sent (e.g. seller has not finished Stripe onboarding)
// processing -> transfer in flight (short-lived lock)
// paid       -> transferred to the seller's Stripe account
// failed     -> Stripe refused the transfer; retried on the next release attempt
export type PayoutStatus = 'not_due' | 'pending' | 'processing' | 'paid' | 'failed';`},"orders-data/intent":{file:"models/Order.ts",start:138,end:138,code:"stripePaymentIntentId: { type: String, unique: true, sparse: true },"}},r=[{area:"health",method:"GET",path:"/api/health",access:"public",file:"app.ts",line:51},{area:"payment",method:"POST",path:"/api/payment/webhook",access:"public",file:"routes/webhook.ts",line:35},{area:"auth",method:"POST",path:"/api/auth/register",access:"public",file:"routes/auth.ts",line:18},{area:"auth",method:"POST",path:"/api/auth/login",access:"public",file:"routes/auth.ts",line:54},{area:"auth",method:"GET",path:"/api/auth/me",access:"signed-in",file:"routes/auth.ts",line:84},{area:"products",method:"GET",path:"/api/products",access:"public",file:"routes/products.ts",line:67},{area:"products",method:"GET",path:"/api/products/mine",access:"signed-in",file:"routes/products.ts",line:97},{area:"products",method:"GET",path:"/api/products/:id",access:"public",file:"routes/products.ts",line:111},{area:"products",method:"POST",path:"/api/products",access:"signed-in",file:"routes/products.ts",line:127},{area:"products",method:"DELETE",path:"/api/products/:id",access:"signed-in",file:"routes/products.ts",line:193},{area:"categories",method:"GET",path:"/api/categories",access:"public",file:"routes/categories.ts",line:9},{area:"categories",method:"POST",path:"/api/categories",access:"signed-in",file:"routes/categories.ts",line:21},{area:"reviews",method:"GET",path:"/api/reviews/:productId",access:"public",file:"routes/reviews.ts",line:9},{area:"reviews",method:"POST",path:"/api/reviews",access:"signed-in",file:"routes/reviews.ts",line:23},{area:"payment",method:"POST",path:"/api/payment/create-payment-intent",access:"signed-in",file:"routes/payment.ts",line:12},{area:"orders",method:"POST",path:"/api/orders/:id/confirm",access:"signed-in",file:"routes/orders.ts",line:33},{area:"orders",method:"POST",path:"/api/orders/:id/fulfillments/:fid/confirm-delivery",access:"signed-in",file:"routes/orders.ts",line:56},{area:"orders",method:"POST",path:"/api/orders/:id/fulfillments/:fid/dispute",access:"signed-in",file:"routes/orders.ts",line:69},{area:"orders",method:"GET",path:"/api/orders",access:"signed-in",file:"routes/orders.ts",line:82},{area:"organizations",method:"POST",path:"/api/organizations",access:"signed-in",file:"routes/organizations.ts",line:85},{area:"organizations",method:"GET",path:"/api/organizations/mine",access:"signed-in",file:"routes/organizations.ts",line:108},{area:"organizations",method:"PUT",path:"/api/organizations/mine",access:"signed-in",file:"routes/organizations.ts",line:121},{area:"organizations",method:"POST",path:"/api/organizations/mine/documents",access:"signed-in",file:"routes/organizations.ts",line:148},{area:"organizations",method:"DELETE",path:"/api/organizations/mine/documents/:docId",access:"signed-in",file:"routes/organizations.ts",line:198},{area:"organizations",method:"POST",path:"/api/organizations/mine/verification-request",access:"signed-in",file:"routes/organizations.ts",line:221},{area:"organizations",method:"GET",path:"/api/organizations/:id/documents/:docId",access:"signed-in",file:"routes/organizations.ts",line:234},{area:"organizations",method:"GET",path:"/api/organizations/:id",access:"public",file:"routes/organizations.ts",line:255},{area:"admin",method:"GET",path:"/api/admin/organizations",access:"Admin",file:"routes/admin.ts",line:25},{area:"admin",method:"POST",path:"/api/admin/organizations/:id/verify",access:"Admin",file:"routes/admin.ts",line:43},{area:"admin",method:"POST",path:"/api/admin/organizations/:id/reject",access:"Admin",file:"routes/admin.ts",line:54},{area:"admin",method:"GET",path:"/api/admin/disputes",access:"Admin",file:"routes/admin.ts",line:65},{area:"admin",method:"POST",path:"/api/admin/orders/:id/fulfillments/:fid/resolve",access:"Admin",file:"routes/admin.ts",line:87},{area:"payouts",method:"GET",path:"/api/payouts/status",access:"signed-in",file:"routes/payouts.ts",line:33},{area:"payouts",method:"POST",path:"/api/payouts/onboarding",access:"signed-in",file:"routes/payouts.ts",line:46},{area:"payouts",method:"POST",path:"/api/payouts/refresh",access:"signed-in",file:"routes/payouts.ts",line:59},{area:"payouts",method:"POST",path:"/api/payouts/dashboard-link",access:"signed-in",file:"routes/payouts.ts",line:73},{area:"sales",method:"GET",path:"/api/sales",access:"signed-in",file:"routes/sales.ts",line:26},{area:"sales",method:"POST",path:"/api/sales/:orderId/fulfillments/:fid/ship",access:"signed-in",file:"routes/sales.ts",line:48},{area:"sales",method:"POST",path:"/api/sales/:orderId/fulfillments/:fid/cancel",access:"signed-in",file:"routes/sales.ts",line:61},{area:"offers",method:"POST",path:"/api/offers",access:"signed-in",file:"routes/offers.ts",line:51},{area:"offers",method:"GET",path:"/api/offers/mine",access:"signed-in",file:"routes/offers.ts",line:61},{area:"offers",method:"GET",path:"/api/offers/received",access:"signed-in",file:"routes/offers.ts",line:78},{area:"offers",method:"POST",path:"/api/offers/:id/accept",access:"signed-in",file:"routes/offers.ts",line:94},{area:"offers",method:"POST",path:"/api/offers/:id/decline",access:"signed-in",file:"routes/offers.ts",line:95},{area:"offers",method:"POST",path:"/api/offers/:id/counter",access:"signed-in",file:"routes/offers.ts",line:96},{area:"offers",method:"POST",path:"/api/offers/:id/accept-counter",access:"signed-in",file:"routes/offers.ts",line:99},{area:"offers",method:"POST",path:"/api/offers/:id/withdraw",access:"signed-in",file:"routes/offers.ts",line:100},{area:"inspections",method:"GET",path:"/api/inspections/inspectors",access:"public",file:"routes/inspections.ts",line:68},{area:"inspections",method:"GET",path:"/api/inspections/product/:productId",access:"public",file:"routes/inspections.ts",line:79},{area:"inspections",method:"GET",path:"/api/inspections/:id/attachment",access:"public",file:"routes/inspections.ts",line:90},{area:"inspections",method:"POST",path:"/api/inspections",access:"signed-in",file:"routes/inspections.ts",line:111},{area:"inspections",method:"GET",path:"/api/inspections/requested",access:"signed-in",file:"routes/inspections.ts",line:123},{area:"inspections",method:"GET",path:"/api/inspections/assigned",access:"signed-in",file:"routes/inspections.ts",line:139},{area:"inspections",method:"POST",path:"/api/inspections/:id/cancel",access:"signed-in",file:"routes/inspections.ts",line:154},{area:"inspections",method:"POST",path:"/api/inspections/:id/accept",access:"signed-in",file:"routes/inspections.ts",line:157},{area:"inspections",method:"POST",path:"/api/inspections/:id/decline",access:"signed-in",file:"routes/inspections.ts",line:158},{area:"inspections",method:"POST",path:"/api/inspections/:id/report",access:"signed-in",file:"routes/inspections.ts",line:164}],i=[{database:"rebiomed",provider:"mongodb",table:"categories",file:"models/Category.ts",line:7,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"name",type:"String",nullable:!1,notes:["unique"]}],denies:[]},{database:"rebiomed",provider:"mongodb",table:"inspections",file:"models/Inspection.ts",line:82,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"product",type:"ObjectId",nullable:!1,notes:["→ products"]},{name:"sellerOrganization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"inspectorOrganization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"requestedBy",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"requestNote",type:"String",nullable:!0,notes:["maxlength 1000"]},{name:"declineNote",type:"String",nullable:!0,notes:["maxlength 1000"]},{name:"status",type:"String",nullable:!0,notes:["enum requested|accepted|completed|declined|cancelled","default requested"]},{name:"report",type:"Object",nullable:!0,notes:[]},{name:"report.inspectedAt",type:"Date",nullable:!1,notes:[]},{name:"report.technicianName",type:"String",nullable:!1,notes:[]},{name:"report.credential",type:"String",nullable:!1,notes:[]},{name:"report.serialNumber",type:"String",nullable:!1,notes:[]},{name:"report.checks",type:"[CheckResult]",nullable:!1,notes:[]},{name:"report.checks[].item",type:"String",nullable:!1,notes:["enum INSPECTION_CHECKS"]},{name:"report.checks[].result",type:"String",nullable:!1,notes:["enum CHECK_RESULTS"]},{name:"report.checks[].notes",type:"String",nullable:!0,notes:["maxlength 1000"]},{name:"report.outcome",type:"String",nullable:!1,notes:["enum INSPECTION_OUTCOMES"]},{name:"report.summary",type:"String",nullable:!1,notes:["maxlength 4000"]},{name:"report.attachment",type:"Object",nullable:!0,notes:[]},{name:"report.attachment.originalName",type:"String",nullable:!1,notes:[]},{name:"report.attachment.storedName",type:"String",nullable:!1,notes:[]},{name:"report.attachment.mimeType",type:"String",nullable:!1,notes:[]},{name:"report.attachment.size",type:"Number",nullable:!1,notes:[]},{name:"report.submittedBy",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"report.submittedAt",type:"Date",nullable:!1,notes:[]},{name:"openKey",type:"String",nullable:!0,notes:["unique sparse"]},{name:"createdAt",type:"Date",nullable:!1,notes:["timestamps"]},{name:"updatedAt",type:"Date",nullable:!1,notes:["timestamps"]}],denies:[],indexes:["{ product: 1, status: 1, 'report.inspectedAt': -1 }","{ inspectorOrganization: 1, status: 1, createdAt: -1 }","{ sellerOrganization: 1, createdAt: -1 }"]},{database:"rebiomed",provider:"mongodb",table:"offers",file:"models/Offer.ts",line:35,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"product",type:"ObjectId",nullable:!1,notes:["→ products"]},{name:"organization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"buyer",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"amountCents",type:"Number",nullable:!1,notes:["min 1"]},{name:"message",type:"String",nullable:!0,notes:["maxlength 1000"]},{name:"counterAmountCents",type:"Number",nullable:!0,notes:["min 1"]},{name:"agreedAmountCents",type:"Number",nullable:!0,notes:["min 1"]},{name:"sellerNote",type:"String",nullable:!0,notes:["maxlength 1000"]},{name:"status",type:"String",nullable:!0,notes:["enum pending|countered|accepted|used|declined|withdrawn|expired","default pending"]},{name:"expiresAt",type:"Date",nullable:!1,notes:[]},{name:"acceptedUntil",type:"Date",nullable:!0,notes:[]},{name:"usedByOrder",type:"ObjectId",nullable:!0,notes:["→ orders"]},{name:"openKey",type:"String",nullable:!0,notes:["unique sparse"]},{name:"createdAt",type:"Date",nullable:!1,notes:["timestamps"]},{name:"updatedAt",type:"Date",nullable:!1,notes:["timestamps"]}],denies:[],indexes:["{ buyer: 1, product: 1, status: 1 }","{ organization: 1, status: 1, createdAt: -1 }"]},{database:"rebiomed",provider:"mongodb",table:"orders",file:"models/Order.ts",line:129,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"user",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"items",type:"[OrderItem]",nullable:!1,notes:[]},{name:"items[].product",type:"ObjectId",nullable:!1,notes:["→ products"]},{name:"items[].organization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"items[].title",type:"String",nullable:!1,notes:[]},{name:"items[].price",type:"Number",nullable:!1,notes:[]},{name:"items[].quantity",type:"Number",nullable:!1,notes:[]},{name:"items[].offer",type:"ObjectId",nullable:!0,notes:["→ offers"]},{name:"fulfillments",type:"[Fulfillment]",nullable:!0,notes:[]},{name:"fulfillments[].organization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"fulfillments[].subtotalCents",type:"Number",nullable:!1,notes:[]},{name:"fulfillments[].platformFeeCents",type:"Number",nullable:!1,notes:[]},{name:"fulfillments[].status",type:"String",nullable:!0,notes:["enum awaiting_payment|awaiting_shipment|shipped|delivered|disputed|cancelled|refunded","default awaiting_payment"]},{name:"fulfillments[].carrier",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].trackingNumber",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].shippedAt",type:"Date",nullable:!0,notes:[]},{name:"fulfillments[].deliveredAt",type:"Date",nullable:!0,notes:[]},{name:"fulfillments[].cancelReason",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].refundId",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].dispute",type:"Object",nullable:!0,notes:[]},{name:"fulfillments[].dispute.reason",type:"String",nullable:!1,notes:[]},{name:"fulfillments[].dispute.openedAt",type:"Date",nullable:!1,notes:[]},{name:"fulfillments[].dispute.resolution",type:"String",nullable:!0,notes:["enum refund|release"]},{name:"fulfillments[].dispute.note",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].dispute.resolvedAt",type:"Date",nullable:!0,notes:[]},{name:"fulfillments[].dispute.resolvedBy",type:"ObjectId",nullable:!0,notes:["→ users"]},{name:"fulfillments[].payout.status",type:"String",nullable:!0,notes:["enum not_due|pending|processing|paid|failed","default not_due"]},{name:"fulfillments[].payout.amountCents",type:"Number",nullable:!1,notes:[]},{name:"fulfillments[].payout.transferId",type:"String",nullable:!0,notes:[]},{name:"fulfillments[].payout.paidAt",type:"Date",nullable:!0,notes:[]},{name:"fulfillments[].payout.error",type:"String",nullable:!0,notes:[]},{name:"subtotal",type:"Number",nullable:!1,notes:[]},{name:"shipping",type:"Number",nullable:!1,notes:[]},{name:"total",type:"Number",nullable:!1,notes:[]},{name:"totalCents",type:"Number",nullable:!1,notes:[]},{name:"currency",type:"String",nullable:!1,notes:[]},{name:"stripePaymentIntentId",type:"String",nullable:!0,notes:["unique sparse"]},{name:"stripeChargeId",type:"String",nullable:!0,notes:[]},{name:"status",type:"String",nullable:!0,notes:["enum pending|processing|paid|failed|refunded","default pending"]},{name:"createdAt",type:"Date",nullable:!0,notes:["default Date.now"]}],denies:[],indexes:["{ 'fulfillments.organization': 1, createdAt: -1 }"]},{database:"rebiomed",provider:"mongodb",table:"organizations",file:"models/Organization.ts",line:81,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"name",type:"String",nullable:!1,notes:[]},{name:"type",type:"String",nullable:!1,notes:["enum ORGANIZATION_TYPES"]},{name:"province",type:"String",nullable:!1,notes:["enum PROVINCES"]},{name:"city",type:"String",nullable:!1,notes:[]},{name:"phone",type:"String",nullable:!0,notes:[]},{name:"website",type:"String",nullable:!0,notes:[]},{name:"mdelNumber",type:"String",nullable:!0,notes:[]},{name:"verificationStatus",type:"String",nullable:!0,notes:["enum VERIFICATION_STATUSES","default unverified"]},{name:"verificationNote",type:"String",nullable:!0,notes:[]},{name:"verifiedAt",type:"Date",nullable:!0,notes:[]},{name:"documents",type:"[VerificationDocument]",nullable:!0,notes:[]},{name:"documents[].kind",type:"String",nullable:!1,notes:["enum DOCUMENT_KINDS"]},{name:"documents[].originalName",type:"String",nullable:!1,notes:[]},{name:"documents[].storedName",type:"String",nullable:!1,notes:[]},{name:"documents[].mimeType",type:"String",nullable:!1,notes:[]},{name:"documents[].size",type:"Number",nullable:!1,notes:[]},{name:"documents[].uploadedAt",type:"Date",nullable:!0,notes:["default Date.now"]},{name:"stripeAccountId",type:"String",nullable:!0,notes:["unique sparse"]},{name:"stripeDetailsSubmitted",type:"Boolean",nullable:!0,notes:["default false"]},{name:"payoutsEnabled",type:"Boolean",nullable:!0,notes:["default false"]},{name:"verificationHistory",type:"[VerificationEvent]",nullable:!0,notes:[]},{name:"verificationHistory[].status",type:"String",nullable:!1,notes:["enum VERIFICATION_STATUSES"]},{name:"verificationHistory[].at",type:"Date",nullable:!0,notes:["default Date.now"]},{name:"verificationHistory[].by",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"verificationHistory[].note",type:"String",nullable:!0,notes:[]},{name:"owner",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"createdAt",type:"Date",nullable:!0,notes:["default Date.now"]}],denies:[]},{database:"rebiomed",provider:"mongodb",table:"products",file:"models/Product.ts",line:68,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"title",type:"String",nullable:!1,notes:[]},{name:"description",type:"String",nullable:!1,notes:[]},{name:"price",type:"Number",nullable:!1,notes:["min 0.01"]},{name:"category",type:"ObjectId",nullable:!1,notes:["→ categories"]},{name:"imageUrl",type:"String",nullable:!1,notes:[]},{name:"stock",type:"Number",nullable:!0,notes:["default 1","min 0"]},{name:"seller",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"organization",type:"ObjectId",nullable:!1,notes:["→ organizations"]},{name:"manufacturer",type:"String",nullable:!1,notes:[]},{name:"deviceModel",type:"String",nullable:!1,notes:[]},{name:"yearOfManufacture",type:"Number",nullable:!0,notes:[]},{name:"deviceClass",type:"String",nullable:!1,notes:["enum DEVICE_CLASSES"]},{name:"mdlNumber",type:"String",nullable:!0,notes:[]},{name:"condition",type:"String",nullable:!1,notes:["enum CONDITIONS"]},{name:"usageHours",type:"Number",nullable:!0,notes:["min 0"]},{name:"lastServiceDate",type:"Date",nullable:!0,notes:[]},{name:"lastCalibrationDate",type:"Date",nullable:!0,notes:[]},{name:"serviceHistory",type:"[ServiceRecord]",nullable:!0,notes:[]},{name:"serviceHistory[].date",type:"Date",nullable:!1,notes:[]},{name:"serviceHistory[].type",type:"String",nullable:!1,notes:["enum SERVICE_TYPES"]},{name:"serviceHistory[].performedBy",type:"String",nullable:!1,notes:[]},{name:"serviceHistory[].notes",type:"String",nullable:!0,notes:[]},{name:"location.province",type:"String",nullable:!1,notes:["enum PROVINCES"]},{name:"location.city",type:"String",nullable:!1,notes:[]},{name:"suspended",type:"Boolean",nullable:!0,notes:["default false"]},{name:"inspection",type:"Object",nullable:!0,notes:[]},{name:"inspection.report",type:"ObjectId",nullable:!1,notes:["→ inspections"]},{name:"inspection.outcome",type:"String",nullable:!1,notes:["enum INSPECTION_OUTCOMES"]},{name:"inspection.inspectedAt",type:"Date",nullable:!1,notes:[]},{name:"inspection.validUntil",type:"Date",nullable:!1,notes:[]},{name:"inspection.inspectorName",type:"String",nullable:!1,notes:[]},{name:"createdAt",type:"Date",nullable:!0,notes:["default Date.now"]}],denies:[]},{database:"rebiomed",provider:"mongodb",table:"reviews",file:"models/Review.ts",line:11,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"product",type:"ObjectId",nullable:!1,notes:["→ products"]},{name:"user",type:"ObjectId",nullable:!1,notes:["→ users"]},{name:"score",type:"Number",nullable:!1,notes:["min 1","max 5"]},{name:"comment",type:"String",nullable:!0,notes:[]},{name:"createdAt",type:"Date",nullable:!0,notes:["default Date.now"]}],denies:[]},{database:"rebiomed",provider:"mongodb",table:"users",file:"models/User.ts",line:12,columns:[{name:"_id",type:"ObjectId",nullable:!1,notes:["PK"]},{name:"name",type:"String",nullable:!1,notes:[]},{name:"email",type:"String",nullable:!1,notes:["unique"]},{name:"password",type:"String",nullable:!1,notes:[]},{name:"isAdmin",type:"Boolean",nullable:!0,notes:["default false"]},{name:"organization",type:"ObjectId",nullable:!0,notes:["→ organizations"]},{name:"createdAt",type:"Date",nullable:!0,notes:["default Date.now"]}],denies:[]}],a=[{path:"/",component:"Home",guards:[]},{path:"/register",component:"Register",guards:[]},{path:"/login",component:"Login",guards:[]},{path:"/products",component:"ProductList",guards:[]},{path:"/products/:id",component:"ProductDetail",guards:[]},{path:"/cart",component:"CartPage",guards:[]},{path:"/checkout",component:"CheckoutForm",guards:["PrivateRoute"]},{path:"/orders",component:"OrderHistory",guards:["PrivateRoute"]},{path:"/sell",component:"SellProduct",guards:["PrivateRoute"]},{path:"/my-listings",component:"MyListings",guards:["PrivateRoute"]},{path:"/organization",component:"OrganizationProfile",guards:["PrivateRoute"]},{path:"/admin/verifications",component:"VerificationQueue",guards:["PrivateRoute"]},{path:"/admin/disputes",component:"DisputeQueue",guards:["PrivateRoute"]},{path:"/offers",component:"OffersPage",guards:["PrivateRoute"]},{path:"/inspections",component:"InspectionsPage",guards:["PrivateRoute"]},{path:"/sales",component:"SalesPage",guards:["PrivateRoute"]},{path:"*",component:"NotFound",guards:[]}],o={project:e,repo:t,files:n,examples:s,endpoints:r,tables:i,routes:a};export{o as default,r as endpoints,s as examples,n as files,e as project,t as repo,a as routes,i as tables};
