import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) { }

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        user: { id: userId } as User,
        status: OrderStatus.PENDING,
        items: [],
      });

      let total = 0;

      for (const itemDto of dto.items) {
        const product = await this.productsService.findOne(itemDto.productId);

        if (!product) {
          throw new NotFoundException(`Product #${itemDto.productId} not found`);
        }

        if (product.stock < itemDto.quantity) {
          throw new Error(`Not enough stock for "${product.name}"`);
        }

        await this.productsService.decreaseStock(product.id, itemDto.quantity);

        const item = manager.create(OrderItem, {
          product,
          quantity: itemDto.quantity,
          unitPrice: product.price,
        });
        order.items.push(item);

        total += product.price * itemDto.quantity;
      }

      order.totalPrice = total;
      return manager.save(order);
    });
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: { user: true, items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  findByUser(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { items: { product: true } },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async cancel(id: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { items: { product: true }, user: true },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.PAID];
    if (cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        'Only pending or paid orders can be cancelled',
      );
    }

    order.items.forEach(async (item) => {
      await this.productsService.increaseStock(item.product.id, item.quantity);
    });

    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    order.status = status;
    return this.ordersRepository.save(order);
  }
}
