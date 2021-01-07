from threading import Thread
from queue import Queue
from random import randint, choice

# the queue.Queue class has internal locks, so I won't need to worry about locking

def producerFunc(queues, itemCount):
    nextItem = 0 # each item is an int starting from 0
    while nextItem < itemCount:
        # need to find which queues have the least number of items
        # queue.qsize() gives the size of the queue
        # first, filter the list for queues that are not full
        # and store their sizes and index in queues
        notFullQueues = [(i, q.qsize()) for i, q in enumerate(queues) if not q.full()]
        # if list is not empty
        if notFullQueues:
            # find the smallest size of all the queues
            minSize = min([size for i, size in notFullQueues])

            # filter the list for all queues of that size and randomly choose one of the indicies
            index = choice([i for i, size in notFullQueues if size == minSize])

            # thus, the queue we want to add to is queues[index]
            item = nextItem
            nextItem += 1
            print(f"Adding item '{item}' to queue {index}")
            queues[index].put(item)
    
    print('Producer thread has finished')


# continuously take items off of the queue
def consumerFunc(queue, queueNum):
    while True:
        if not queue.empty():
            item = queue.get()
            print(f"Removed item '{item}' from queue {queueNum}")
            queue.task_done() # tells the queue when to stop blocking queue.join() at the end

MIN_MAXSIZE = 5
MAX_MAXSIZE = 20
QUEUE_AMOUNT = 3

queues = []
consumers = []
for i in range(QUEUE_AMOUNT):
    size = randint(MIN_MAXSIZE, MAX_MAXSIZE) # each queue has a random maximum size
    print('Creating queue ' + str(i) + ' with maximum size ' + str(size))
    queues.append(Queue(size)) # holds each list along with its current length
    consumers.append(Thread(target=consumerFunc, args=(queues[i], i), daemon=True)) # assign each consumer to a queue

# prompt user for length of time to run
itemCount = 0
while (itemCount <= 0):
    inputStr = input("How many items to produce? ")
    if (inputStr.isnumeric()):
        itemCount = int(inputStr)

producer = Thread(target=producerFunc, args=(queues, itemCount))

print('Starting production')

producer.start()
for consumer in consumers:
    consumer.start()

# once all items are produced, the producer thread ends
# then we wait for all the queues to empty by using queue.join()
producer.join()
for queue in queues:
    queue.join()

print('Program terminated.')